import http, { RequestOptions } from "http";
import https from "https";
import axios from "axios";
import { DynamoDB, SES } from "aws-sdk";
import { IDBItem } from "../model/dynamoType";

export const weekOfCurrentDay = () => {
  let currentDate = new Date();
  let startDate = new Date(currentDate.getFullYear(), 0, 1);
  let days = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  return Math.ceil(days / 7);
};

// another post not using axios
export const post = (
  isHttps: boolean,
  url: string,
  options: RequestOptions,
  payload: string
): any =>
  new Promise((resolve, reject) => {
    const cb = (res) => {
      let buffer = "";
      res.on("data", (chunk) => (buffer += chunk));
      res.on("end", () => resolve(JSON.parse(buffer)));
    };
    let req: any;
    if (isHttps) {
      req = https.request(url, options, cb);
    } else {
      req = http.request(url, options, cb);
    }

    req.on("error", (e) => reject(e.message));
    req.write(payload);
    req.end();
  });

export const sendEmail = async (
  to: string,
  subject: string,
  message: string
) => {
  const ses = new SES();

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: { Data: message },
      },
      Subject: { Data: subject },
    },
    Source: process.env.ADMIN_EMAIL,
  };

  console.log("sendVerifyEmail: ", params);
  await ses.sendEmail(params).promise();
};
export const verifyRecaptcha = async (response: string) => {
  response = response;
  const secret = process.env.RECAP_SECRET;
  // google is blocked in China, use recaptcha instead
  //const reCapUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${response}`;
  const reCapUrl = `https://www.recaptcha.net/recaptcha/api/siteverify?secret=${secret}&response=${response}`;

  // console.log(reCapUrl);
  try {
    let verifyResult = await axios.post(reCapUrl);
    // console.log("verifyResult: ", verifyResult);
    return verifyResult.data.success;
  } catch (e) {
    console.log("verifyRecaptcha error: ", e);
    return false;
  }
};

export const isNotExpired = (createdTime: string) => {
  // token expired in 12hour
  const currentTime = new Date().getTime();
  return createdTime && currentTime < +createdTime + 12 * 3600 * 1000;
};

export const newToken = (email: string) => {
  const currentTime = new Date().getTime();
  console.warn("New a (weak) token");
  // token format: random-email(base64)-timestamp, for convinience to get email
  const returnedToken =
    (Math.random() + 1).toString(36).substring(2) +
    "-" +
    btoa(email) +
    `-${currentTime}`;
  return returnedToken;
};
export const parseToken = (tokenId?: string) => {
  let email = "";
  let createdTime = "";

  if (tokenId) {
    if (tokenId && (email = tokenId.split("-")[1])) {
      email = atob(email);
      createdTime = tokenId.split("-")[2];

      if (!isNotExpired(createdTime)) {
        email = "";
        createdTime = "";
      }
    }
  }
  return { email, createdTime };
};
// Code is in the same format as tokenId, sometimes needs to check code .
export const getDbItemByToken = async (tokenId: string, isCode = false) => {
  const parsed = parseToken(tokenId);
  // console.log("parsed ", parsed);
  const createdTime = parsed.createdTime;
  let userEmail = parsed.email;

  if (isNotExpired(createdTime)) {
    // console.log("tokeId ", tokenId, "userEmail ", userEmail);
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

      // token format: random-email(base64)-timestamp
      // console.log("ret is ", ret);
      if (!!ret.Item) {
        if (isCode && ret.Item.code == tokenId) {
          return ret.Item as IDBItem;
        }

        if (!isCode && ret.Item.tokenId == tokenId) {
          return ret.Item as IDBItem;
        }
      }
    } catch (e) {
      // console.log(e)
    }
  }
  return;
};
