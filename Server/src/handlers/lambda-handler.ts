/**
 * AWS Lambda entry — serverless-http(app); DB connected before handling (Atlas + Lambda pattern).
 */
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import serverlessHttp from "serverless-http";
import { initDB } from "../config/bootstrap";
import { app } from "../index";

const httpHandler = serverlessHttp(app, {
  binary: ["image/*", "application/pdf"],
  // serverless-http pins req.ip to API Gateway's sourceIp, which is the
  // CloudFront edge. Drop it so Express derives the client IP from
  // X-Forwarded-For using the app's "trust proxy" setting.
  request: (request: object) => {
    Reflect.deleteProperty(request, "ip");
  },
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
