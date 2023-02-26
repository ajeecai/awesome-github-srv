import { DynamoDB, SES } from "aws-sdk";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { IDBItem, IEmailsOnTopic } from "../model/dynamoType";
import axios from "axios";
import { IGitHubData } from "../model/githubTypes";
import { buildEmail, listGenerator } from "../template/emailTemplate";

const ses = new SES();
const dynamoDb = new DynamoDB.DocumentClient();

interface IMileStone {
  trend: IGitHubData[];
  starLevel: IGitHubData[];
}
const getSubscriberEmails = async () => {
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: process.env.DYNAMODB_TABLE,
    ExpressionAttributeValues: {
      ":v1": true,
      ":v2": "",
    },
    ExpressionAttributeNames: {
      "#language": "language",
    },
    FilterExpression: "verified=:v1 AND #language<>:v2",
    ProjectionExpression: "email,#language,since,verified",
  };
  let queries = await dynamoDb.scan(params).promise();

  return queries.Items;
};
export const cronSendEmail = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  if (
    event["source"] != "aws.events" &&
    event.headers?.Host.split(":")[0] != "127.0.0.1" // for internal test only
  ) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: "Unauthorized " }),
    };
  }
  let entries = getSubscriberEmails();
  let emailsOnTopic: IEmailsOnTopic[] = [];
  (await entries).forEach((e) => {
    let t: IDBItem = e as any;
    t.language.split("&").forEach((lang) => {
      let key = `language=${lang}&since=${t.since}`;
      let i = 0;
      for (i = 0; i < emailsOnTopic.length; ++i) {
        if (key == emailsOnTopic[i].topic) {
          emailsOnTopic[i].emails.push(t.email);
          break;
        }
      }
      if (i == emailsOnTopic.length) {
        // new topic
        emailsOnTopic.push({ topic: key, emails: [e.email] });
      }
    });
    // console.log("t is ", t.email, t.language, t.since);
  });
  // console.log(emailsOnTopic);

  for (const e of emailsOnTopic) {
    let htmlTrend = "";
    let htmlLevel = "";
    let htmlContent = "";
    let language = "";
    let count = 0;

    const milstoneData = (
      await axios.get(`${process.env.API_URL}/dev/langmilestone?${e.topic}`)
    ).data.data as IMileStone;
    if (!milstoneData) {
      console.log("topic %s return null data ", e.topic);
      continue;
    }
    // console.log("milstoneData.trend: ", milstoneData);
    milstoneData.trend.forEach((e) => {
      language = e.language;
      htmlTrend += listGenerator(
        e.reponame,
        e.repourl,
        e.repodesc,
        e.stars,
        e.laststars
      );
    });
    // console.log("htmlTrend: ", htmlTrend);

    count = 0;
    milstoneData.starLevel.forEach((e) => {
      count++;
      if (count <= 10) {
        htmlLevel += listGenerator(
          e.reponame,
          e.repourl,
          e.repodesc,
          e.stars,
          0
        );
      }
    });

    htmlContent = buildEmail(
      language,
      milstoneData.trend.length,
      htmlTrend,
      htmlLevel
    );

    const params = {
      Destination: {
        BccAddresses: e.emails,
      },
      Message: {
        Body: {
          Html: { Charset: "UTF-8", Data: htmlContent },
        },
        Subject: { Data: "Your subscription on asgithub" },
      },
      Source: process.env.ADMIN_EMAIL,
    };

    // console.log("send topic email: ", params);
    try {
      await ses.sendEmail(params).promise();
    } catch (e) {
      console.error(
        `Could not send to ${params.Destination} because of ${e.message}`
      );
      const statusCode = typeof e.code === "number" ? e.code : 500;
      return {
        statusCode,
        body: JSON.stringify({ data: e.message }),
      };
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ data: "ok" }),
  };

  return response;
};
