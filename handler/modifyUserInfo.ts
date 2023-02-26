import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getDbItemByToken, parseToken } from "../helper/helper";

export const modifyUserInfo = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const tokenId = event.headers["token"];
  const user = JSON.parse(event.body);

  const parsed = parseToken(tokenId);
  let userEmail = parsed.email;
  const dbItem = await getDbItemByToken(tokenId);
  const dynamoDb = new DynamoDB.DocumentClient();

  let code = 401;
  let errMsg = "Access Denied!";
  if (!!dbItem) {
    if (!user.passWord) {
      // not change password
      user.passWord = dbItem.password;
    }
    // valid user token, modify user info
    const updateParams: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        email: userEmail,
      },
      UpdateExpression: "set nickname = :p, password = :r",
      ExpressionAttributeValues: {
        ":p": user.userName,
        ":r": user.passWord,
      },
    };

    try {
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

      return {
        statusCode: 200,
        body: JSON.stringify({
          data: {
            tokenId: dbItem.tokenId,
            userName: user.userName,
            userEmail: userEmail,
          },
        }),
      };
    } catch (e) {
      console.log(e);
      code = typeof e.code === "number" ? e.code : 500;
      errMsg = e.message;
    }
  }

  return {
    statusCode: code,
    body: JSON.stringify({ data: errMsg }),
  };
};
