import { DynamoDB, SNS } from "aws-sdk";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getDbItemByToken } from "../helper/helper";

const dynamoDb = new DynamoDB.DocumentClient();
const sns = new SNS();
const publishToSNS = async (message: string) => {
  // console.log("publishToSNS: ", process.env.SNS_TOPIC_ARN);
  try {
    await sns
      .publish({
        Message: message,
        TopicArn: process.env.SNS_TOPIC_ARN,
      })
      .promise();
  } catch (e) {
    console.log("sns: e ", e);
  }
};

export const verifyEmail = async (
  event: APIGatewayEvent,
  _context: Context /*, callback*/
): Promise<APIGatewayProxyResult> => {
  let email = event.multiValueQueryStringParameters.email[0];
  let tokenId = event.multiValueQueryStringParameters.code[0];
  console.log(email, tokenId);
  const timestamp = new Date().getTime();

  let code = 401;
  let errMsg = "Invalid request or expired";
  const dbItem = await getDbItemByToken(tokenId);

  if (!!dbItem && !dbItem.verified) {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        email,
      },
      UpdateExpression: "set verified = :p, updatedAt = :r",
      ExpressionAttributeValues: {
        ":p": true,
        ":r": timestamp,
      },
    };

    try {
      await dynamoDb
        .update(params, (error, result) => {
          // handle potential errors
          if (error) {
            console.error(error);
          } else {
            console.log("update db item successfully, result is: ", result);
          }
        })
        .promise();

      await publishToSNS("a new subscriber from " + email);
      code = 200;
      errMsg = "OK";
    } catch (e) {
      code = typeof e.code === "number" ? e.code : 500;
      errMsg = e.message;
    }
  }

  // create a response
  const response = {
    statusCode: code,
    body: JSON.stringify({ data: errMsg }),
  };

  return response;
};
