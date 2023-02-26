import githubTrends from "github-trends-api";
import { S3 } from "aws-sdk";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import axios from "axios";
import { IGitHubData, IGitHubStars } from "../model/githubTypes";
import { weekOfCurrentDay } from "../helper/helper";

const s3 = new S3();

export const getLangMileStone = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let options = event["queryStringParameters"];
  console.log("query option is ", options);
  // const options = {
  //   section: '', // default: empty (repositories) - or 'developers'
  //   language: 'javascript', // default: empty (all) - or 'javascript', 'java' etc..
  //   since: 'weekly', // default: empty (daily) - or 'weekly', 'monthly'
  //   spoken_language_code: '', // default: empty (all) - or en - fs - zh ...
  // }
  const language = options["language"];
  if (!language) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        data: "Invalid request parameters",
      }),
    };
  }
  let year = new Date().getFullYear();
  let week = weekOfCurrentDay() - 1; // to get last week

  // round down
  if (week <= 0) {
    year -= 1;
    week = 52;
  }
  const timeStamp =
    year.toString() + "-week-" + week.toString().padStart(2, "0");
  const fileName = [
    {
      type: "trend",
      name:
        `trend-${timeStamp}-${options["language"]}` +
        (options["since"] ? `-${options["since"]}` : "") +
        ".json",
      func: async () => {
        let starRepos: IGitHubData[] = await githubTrends(options);
        return starRepos.sort((a, b) => b.laststars - a.laststars).slice(0, 20);
      },
    },
    {
      type: "starLevel",
      name: `starlevel-${timeStamp}-${options["language"]}` + ".json",
      func: async () => {
        const starNums = [100, 500, 1000];
        let starRepos = [] as IGitHubData[];
        for (const s of starNums) {
          // github api not allow query freqently, will save the response into s3s
          const stars =
            // Upon reaching here, the language option has been decoded from url, so encode again.
            (
              await axios.get(
                `https://api.github.com/search/repositories?q=language:${encodeURIComponent(
                  language
                )}+stars:${s} `
              )
            ).data.items as IGitHubStars[];

          if (!stars) {
            continue;
          }

          stars.slice(0, 10).forEach((e) => {
            starRepos.push({
              reponame: e.name,
              repourl: e.html_url,
              repodesc: e.description,
              stars: e.stargazers_count,
            } as IGitHubData);
          });
        }
        return starRepos;
      },
    },
  ];

  let responseData = {};

  for (const f of fileName) {
    let isExisting = false;
    let content = {};
    console.log("fileName is ", f.name);
    try {
      console.log(`now try to get ${f.name} from s3`);
      let c = await s3
        .getObject({
          Bucket: process.env.S3_BUCKET,
          Key: f.name,
        })
        .promise();

      content = JSON.parse(c.Body.toString("utf-8"));
      // console.log("c is ", c);
      if (!!c.ContentLength) {
        isExisting = true;
      }
    } catch (e) {
      console.log("could not get this file: ", f.name);
      // ignore this exception and go on to get new file
    }

    if (isExisting) {
      console.log(`existing file for ${f.name}`);
    } else {
      console.log(`now try to get ${f.name} from github`);
      try {
        content = await f.func();
      } catch (e) {
        console.error("exception f.func: ", e);
        const statusCode = typeof e.code === "number" ? e.code : 500;
        return {
          statusCode,
          body: JSON.stringify({ data: e.message }),
        };
      }
      console.log(`now save ${f.name} to s3`);

      try {
        s3.putObject(
          {
            Bucket: process.env.S3_BUCKET,
            Key: f.name,
            Body: JSON.stringify(content),
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
        console.log("could not save this file: %s ", f.name, e);
        const statusCode = typeof e.code === "number" ? e.code : 500;
        return {
          statusCode,
          body: JSON.stringify({ data: e.message }),
        };
      }
    }
    responseData[f.type] = content;
    // console.log("content is ", content, ",responseData is ", responseData);
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify({ data: responseData }),
  };

  return response;
};
