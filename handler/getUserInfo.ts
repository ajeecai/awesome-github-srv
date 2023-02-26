import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { getDbItemByToken } from "../helper/helper";

export const getUserInfo = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const tokenId = event.headers["token"];
  console.log("tokenId ", tokenId);

  const dbItem = await getDbItemByToken(tokenId);
  if (!dbItem) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: "Access Denied" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        userName: dbItem.nickname,
        userEmail: dbItem.email,
        subscription: dbItem.language,
      },
    }),
  };
};
