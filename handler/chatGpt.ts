import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import axios from "axios";
import { getDbItemByToken } from "../helper/helper";
// TODO: looks like serverless framework doesn't support ES module per handler now
// import chatGPT from "chatgpt-io";
//https://aws.amazon.com/blogs/compute/using-node-js-es-modules-and-top-level-await-in-aws-lambda/

export const chatGpt = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const tokenId = event.headers["token"];
  const dbItem = await getDbItemByToken(tokenId);
  // console.log("tokenId ", tokenId);
  const req = JSON.parse(event.body);

  if (!dbItem) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        data: "Access Denied!",
      }),
    };
  }
  if (!req.data) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        data: "Invalid reqeust",
      }),
    };
  }

  let result: any;
  // await (async function () {
  //   let bot = new chatGPT(process.env.OPENAI_TOKEN);
  //   await bot.waitForReady();

  //   // default conversation
  //   let result = await bot.ask("Hello?");
  //   console.log(result);
  // })();

  try {
    result = await axios.post(
      process.env.CHATGPT_URL,
      {
        polling: req.data.polling,
        message_id: req.data.message_id,
        message: req.data.message, //in later polling, there is no message content
        conversation_id: req.data.conversation_id,
        pre_sharedkey: process.env.CHATGPT_KEY,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // console.log("response from chatgpt is ", result);
  } catch (e) {
    result = {};
    result.status =
      typeof e.code === "number" ? e.code : e.request?.res?.statusCode ?? 500;

    result.statusText =
      result.status == 204 ? "Response is not ready, please wait" : e.message;
  }
  // console.log("result ", result.data);
  let data = result.status == 200 ? result.data.response : result.statusText;
  data = data ?? "Error: Timeout";
  const response = {
    statusCode: result.status,
    body: JSON.stringify({
      data,
    }),
  };

  return response;
};
