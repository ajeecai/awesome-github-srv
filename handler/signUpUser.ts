import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { AWSError, DynamoDB } from "aws-sdk";
import { newToken, sendEmail, verifyRecaptcha } from "../helper/helper";

const createNewUser = async (
  nickname: string,
  email: string,
  password: string,
  _host: string
) => {
  const timestamp = new Date().getTime();
  const tokenId = newToken(email);
  const dynamoDb = new DynamoDB.DocumentClient();

  try {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        nickname,
        email,
        code: "",
        verified: false,
        password,
        tokenId,
        language: "",
        since: "",
        updatedAt: timestamp,
        createdAt: timestamp,
      },
    };
    // console.log("params is ", params);

    let err: AWSError;

    // This is for async
    // Not working without promise and await. The commented sync below is also working.
    await dynamoDb
      .put(params, (error, result) => {
        // handle potential errors
        err = error;
        if (err) {
          console.error(err);
        } else {
          console.log("create db item successfully, result is: ", result);
        }
      })
      .promise();

    // console.log(event);
    let link = `${process.env.API_URL}/dev/verifyEmail?email=${email}&code=${tokenId}`;

    await sendEmail(
      email,
      "Email Address Verification Request from asgithub",
      `Please click this link to verify your signup in 12 hours: ${link}`
    );
  } catch (e) {
    // console.log("error message ", e.message);
    const statusCode = typeof e.code === "number" ? e.code : 500;
    return {
      statusCode,
      body: JSON.stringify({ data: e.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data:
        `Please check your email for "Email Address Verification Request "` +
        ` from ${process.env.ADMIN_EMAIL}, and click the link.`,
    }),
  };

  // This is for sync
  // dynamoDb.put(params, (error, data) => {
  //   err = error
  //   if (error) {
  //     console.error(error);
  //     callback(error);
  //     return;
  //   }
  //   //create a response
  //   const response = {
  //     statusCode: 200,
  //     body: JSON.stringify(data),
  //   };
  //   callback(null, response);
  // });
  // return;
};

export const signUpUser = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const user = JSON.parse(event.body);
  const host = event.headers.host;
  // console.log("event is ", event);

  let userEmail = user.userEmail;
  let userName = user.userName;
  let passWord = user.passWord;
  let code = 401;
  let message = "Access Denied!";

  if (!(await verifyRecaptcha(user.reCaptCha))) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: "Can't pass reCaptCha" }),
    };
  }

  console.log("signup: pass reCaptCha");
  if (!!userName && !!userEmail && !!passWord) {
    try {
      const dynamoDb = new DynamoDB.DocumentClient();
      const searchParams: DynamoDB.DocumentClient.GetItemInput = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          email: userEmail,
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

      // console.log("ret.Item is ", ret.Item);
      if (!!ret.Item && ret.Item.verified) {
        message = "This email has been existing!";
      } else {
        console.log("now sign up this user ");

        // console.log("user: ", user);
        const response = await createNewUser(
          userName,
          userEmail,
          passWord,
          host
        );
        // console.log("response is ", response);
        return {
          statusCode: response.statusCode,
          body: response.body,
        };
        return;
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
