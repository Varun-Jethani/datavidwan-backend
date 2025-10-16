import serverlessExpress from '@codegenie/serverless-express';

import app from './src/app.js';
import connectDB from './src/db/index.js';

let isDbConnected = false;

async function bootstrap() {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }

  return serverlessExpress({ app });
}

const handlerPromise = bootstrap();

export const handler = async (event, context) => {
  const serverlessApp = await handlerPromise;
  return serverlessApp(event, context);
};
