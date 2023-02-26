import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getDbItemByToken, newToken, sendEmail } from "../helper/helper";
import { IDBItem } from "../model/dynamoType";

export const resetPassword = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // const host = event.headers.host;
  let options = event["queryStringParameters"];
  let userEmail = options.email;
  let rCode = options.code;
  let passWord = options.password;

  console.log("options is ", options);
  let code = 401;
  let message = "Access Denied";

  if (!!rCode) {
    //reset password with token
    const dbItem = await getDbItemByToken(rCode, true);
    console.log(dbItem);
    if (!dbItem) {
      code = 401;
      message = "Access denied or this link has been used!";
    } else {
      console.log("email: ", userEmail);
      const dynamoDb = new DynamoDB.DocumentClient();
      const updateParams: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          email: userEmail,
        },

        UpdateExpression: "set code = :p, password = :r",
        ExpressionAttributeValues: {
          ":p": "", // invalidate code
          ":r": passWord,
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
        code = 200;
        message = "Modify password OK !";
      } catch (e) {
        console.log(e);
        code = typeof e.code === "number" ? e.code : 500;
        message = e.message;
      }
    }
  } else if (!!userEmail) {
    // this is the first call for reset password
    try {
      const dynamoDb = new DynamoDB.DocumentClient();
      const searchParams: DynamoDB.DocumentClient.GetItemInput = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          email: userEmail,
        },
      };
      // console.log("params is ", params);

      const dbItem: IDBItem = (
        await dynamoDb
          .get(searchParams, (error, _result) => {
            // handle potential errors
            if (error) {
              console.error(error);
            } else {
              // console.log("get db item successfully, result is: ", result);
            }
          })
          .promise()
      ).Item as IDBItem;

      // console.log("ret.Item is ", ret.Item);
      if (!dbItem || !dbItem.verified) {
        message = "This email is not existing or activated!";
      } else {
        // reset code, the same format as token, saved to db
        const resetCode = newToken(userEmail);
        const updateParams: DynamoDB.DocumentClient.UpdateItemInput = {
          TableName: process.env.DYNAMODB_TABLE,
          Key: {
            email: userEmail,
          },
          UpdateExpression: "set code = :r ",
          ExpressionAttributeValues: {
            ":r": resetCode,
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

        console.log("now send reset email ");
        let link = `${process.env.UI_URL}/forgetpass?email=${encodeURIComponent(
          userEmail
        )}&code=${resetCode}`;

        await sendEmail(
          userEmail,
          "Reset your password",
          `Please click this link to reset your password in 12 hours: ${link}`
        );

        code = 200;
        message = "Please check your email.";
      }
    } catch (e) {
      console.log(e);
      code = typeof e.code === "number" ? e.code : 500;
      message = e.message;
    }
  }

  return {
    statusCode: code,
    body: JSON.stringify({ data: message }),
  };
};
