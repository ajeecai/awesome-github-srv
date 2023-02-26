import { AWSError, DynamoDB } from "aws-sdk";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getDbItemByToken, parseToken } from "../helper/helper";

export const subscribeTopic = async (
  event: APIGatewayEvent,
  _context: Context /*, callback*/
): Promise<APIGatewayProxyResult> => {
  console.log(event.body);
  const data = JSON.parse(event.body);
  const newSubScription = data.subscription;
  const tokenId = data.tokenId;

  const creds = parseToken(tokenId);
  const userEmail = creds.email;
  let code = 401;
  let errMsg = "Access Denied";

  if (!userEmail) {
    return {
      statusCode: 400,
      body: JSON.stringify({ data: "invalid params" }),
    };
  }

  // console.log("data: ", data);
  const dbItem = await getDbItemByToken(tokenId);
  if (!!dbItem) {
    let currentSubScription = dbItem.language ? dbItem.language.split("&") : [];
    if (!data.unsubscribed) {
      const lanugage = newSubScription;

      // add new entry, not unsubscribed
      if (currentSubScription.length >= 3) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            data: "Your subscription has been reached maximum: 3",
          }),
        };
      }

      if (currentSubScription.every((e) => e != lanugage)) {
        // console.log("Add new %s to existing %s", lanugage, currentSubScription);
        currentSubScription.push(lanugage);
      }
    } else {
      currentSubScription = newSubScription;
    }
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: { email: creds.email },
      ExpressionAttributeNames: {
        "#email": "email",
        "#language": "language",
      },
      ExpressionAttributeValues: {
        ":a": creds.email,
        ":p": currentSubScription.join("&"),
        ":r": "weekly", // now hard code all for weekly
      },
      ConditionExpression: "#email=:a",
      UpdateExpression: "set #language = :p, since = :r",
    };
    // console.log("params is ", params);

    let err: AWSError;
    const dynamoDb = new DynamoDB.DocumentClient();
    // This is for async
    // Not working without promise and await. The commented sync below is also working.
    try {
      await dynamoDb
        .update(params, (error, result) => {
          // handle potential errors
          err = error;
          if (err) {
            console.error(err);
          } else {
            console.log("Update db item successfully, result is: ", result);
          }
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          data: "OK, will send you by email weekly.",
        }),
      };
    } catch (e) {
      // console.log("error message ", e.message);
      code = typeof e.code === "number" ? e.code : 500;
      errMsg = e.message;
    }
  }

  return {
    statusCode: code,
    body: JSON.stringify({ data: errMsg }),
  };
};
