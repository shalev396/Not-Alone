/**
 * AWS Lambda entry — serverless-http(app); DB connected before handling (Atlas + Lambda pattern).
 */
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import serverlessHttp from "serverless-http";
import { initDB } from "../config/bootstrap";
import { app } from "../index";

const httpHandler = serverlessHttp(app, {
  binary: ["image/*", "application/pdf"],
});

let dbReady: Promise<void> | null = null;
function ensureDb(): Promise<void> {
  if (!dbReady) {
    dbReady = initDB();
  }
  return dbReady;
}

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDb();
  return httpHandler(event, context);
};
