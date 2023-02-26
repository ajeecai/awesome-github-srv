import { BigQuery } from "@google-cloud/bigquery";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import { bigQuerySQL } from "../helper/bigQuery";
import { weekOfCurrentDay } from "../helper/helper";

export const queryTip = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let query = JSON.parse(event.body);

  let year = new Date().getFullYear();
  let week = weekOfCurrentDay() - 1; // to get last week
  const s3 = new S3();
  let msg: any;

  // round down
  if (week <= 0) {
    year -= 1;
    week = 52;
  }
  const timeStamp =
    year.toString() + "-week-" + week.toString().padStart(2, "0");

  const fileName = `tip-${query.issue}-${timeStamp}.json`;

  try {
    console.log(`now try to get ${fileName} from s3`);
    let c = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
      })
      .promise();
    // console.log("c is ", c);
    if (!!c.ContentLength) {
      console.log(`${fileName} existing!`);
      msg = JSON.parse(c.Body.toString("utf-8"));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: msg }),
    };
  } catch {
    // ignore this exception and go on to get new file
  }

  const bigQuery = new BigQuery({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
    },
  });
  // console.log("bigQuery: ", bigQuerySQL[query.issue]);
  const options = {
    query: bigQuerySQL[query.issue].sql,
    // Location must match that of the dataset(s) referenced in the query.
    location: "US",
    useLegacySql: bigQuerySQL[query.issue].legacy, // legacy sql
  };

  console.log("queryTip:", options);
  try {
    const [job] = await bigQuery.createQueryJob(options);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    // console.log("Rows:", rows);
    // rows.forEach((row) => console.log(row));

    msg = rows[0];

    console.log(`now save ${fileName} to s3`);
    s3.putObject(
      {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: JSON.stringify(msg),
      },
      (err, data) => {
        if (err) {
          console.error("put s3 error:", err);
        } else {
          console.log("s3 putObject done:", data);
        }
      }
    );
  } catch (e) {
    // console.log("exception: ", e);
    let code = typeof e.code !== "number" ? 500 : e.code;
    return {
      statusCode: code,
      body: JSON.stringify({ code, data: e.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: msg }),
  };
};
