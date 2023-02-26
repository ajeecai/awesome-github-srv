import { BigQuery } from "@google-cloud/bigquery";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import { weekOfCurrentDay } from "../helper/helper";

export const getReposOfLangs = async (
  _event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // let options = event["queryStringParameters"];
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

  const fileName = `repos-langs-${timeStamp}.json`;

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

  try {
    // const query = `SELECT h.name,COUNT(h.name) AS count
    // FROM \`bigquery-public-data.github_repos.languages\`, UNNEST(language) as h
    // group by h.name order by count DESC`;

    // only select the most dominant language of the repository
    // idea from https://stackoverflow.com/questions/6930583/how-to-return-multiple-columns-when-using-group-by-in-sql
    // But, performance ok?
    // const query = `With M as (SELECT repo_name,name,bytes
    //                           FROM \`bigquery-public-data.github_repos.languages\`, UNNEST(language)
    //                      )
    //               SELECT name, COUNT(name) as count FROM
    //               (  SELECT repo_name, name, bytes
    //                 FROM M
    //                 JOIN
    //                   (SELECT repo_name as r, MAX(bytes) as b
    //                   FROM M
    //                   GROUP BY r
    //                   ) N ON N.r = M.repo_name AND N.b = M.bytes
    //               )
    //               GROUP BY name ORDER BY count DESC
    //               `;

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    // const options = {
    //   query: query,
    //   // Location must match that of the dataset(s) referenced in the query.
    //   location: "US",
    // };

    console.log("now try to bigquery...");
    const bigQuery = new BigQuery({
      projectId: process.env.PROJECT_ID,
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY,
      },
    });

    // This query should be better than the above
    const sql = `SELECT lang as name, count(lang) as repoCount FROM
                (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY repo_name ORDER BY lang) as num FROM
                    (
                      SELECT repo_name, FIRST_VALUE(language.name) OVER (partition by repo_name order by language.bytes DESC) AS lang
                      FROM [bigquery-public-data:github_repos.languages]
                    )
                )WHERE num = 1
                GROUP BY name ORDER by repoCount DESC`;

    const options = {
      query: sql,
      // Location must match that of the dataset(s) referenced in the query.
      location: "US",
      useLegacySql: true, // legacy sql
    };

    const [job] = await bigQuery.createQueryJob(options);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    // console.log("Rows:");
    // rows.forEach((row) => console.log(row));

    // With new query, exclude the last entry which is null
    msg = rows.slice(0, rows.length - 1);

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
    // console.log("exception: ", e.code, e.message);
    const statusCode = typeof e.code === "number" ? e.code : 500;
    return {
      statusCode,
      body: JSON.stringify({ data: e.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: msg }),
  };
};
