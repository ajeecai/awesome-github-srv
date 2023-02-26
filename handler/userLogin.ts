import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import {
  isNotExpired,
  newToken,
  parseToken,
  verifyRecaptcha,
} from "../helper/helper";

interface Credential {
  userEmail: string;
  passWord: string;
  reCaptCha: string;
}

export const userLogin = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const data: Credential = JSON.parse(event.body);
  let returnedToken = "";
  let userName = "";

  if (!data.userEmail || !data.passWord || !data.reCaptCha) {
    console.log(data);
    return {
      statusCode: 400,
      body: JSON.stringify({ data: "invalid parameters" }),
    };
  }
  console.log("now check the reCaptCha");
  if (!(await verifyRecaptcha(data.reCaptCha))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ data: "Can't pass reCaptCha" }),
    };
  }
  console.log("ok, pass reCaptCha");
  try {
    const dynamoDb = new DynamoDB.DocumentClient();
    const searchParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        email: data.userEmail,
      },
    };

    // console.log("params is ", params);
    let ret = await dynamoDb
      .get(searchParams, (error, _result) => {
        // handle potential errors
        if (error) {
          console.error(error);
        } else {
          // console.log("get db item successfully, result is: ", result);
        }
      })
      .promise();

    if (!ret.Item || ret.Item.password != data.passWord || !ret.Item.verified) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          data: "username or password mismatched, or user not activated yet",
        }),
      };
    }

    const tokenCreatedTime = parseToken(ret.Item.tokenId).createdTime;

    userName = ret.Item.nickname;
    console.log("tokenCreatedTime ", tokenCreatedTime);

    if (isNotExpired(tokenCreatedTime)) {
      returnedToken = ret.Item.tokenId;
      console.log("using exiting token");
    } else {
      // generate new token
      returnedToken = newToken(data.userEmail);

      const updateParams: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          email: data.userEmail,
        },

        UpdateExpression: "set tokenId = :p",
        ExpressionAttributeValues: {
          ":p": returnedToken,
        },
      };
      await dynamoDb
        .update(updateParams, (error, result) => {
          // handle potential errors
          if (error) {
            console.error(error);
          } else {
            console.log("update db item successfully, result is: ", result);
          }
        })
        .promise();
    }
  } catch (e) {
    console.log("exception: ", e);
    const statusCode = typeof e.code === "number" ? e.code : 500;
    return {
      statusCode,
      body: JSON.stringify({ data: e.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { userName: userName, tokenId: returnedToken },
    }),
  };
};
