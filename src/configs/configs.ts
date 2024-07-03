import * as process from 'node:process';
import * as dotenv from "dotenv";
import { Configs } from './configs.type';

const environment = process.env.APP_ENVIRONMENT || 'local';
dotenv.config({ path: `environments/${environment}.env` });

export default (): Configs => ({
  app: {
    port: parseInt(process.env.APP_PORT) || 3000,
    host: process.env.APP_HOST || '0.0.0.0',
  },
  database: {
    port: parseInt(process.env.POSTGRES_PORT),
    host: process.env.POSTGRES_HOST,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db_name: process.env.POSTGRES_DB,
  },
  redis: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    refresh_expires_in: parseInt(process.env.JWT_REFRESH_EXPIRES_IN),
    access_expires_in: parseInt(process.env.JWT_ACCESS_EXPIRES_IN),
    access_secret: process.env.JWT_ACCESS_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
  },
  aws: {
    accessKey: process.env.AWS_S3_ACCESS_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_REGION,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    bucketUrl: process.env.AWS_S3_BUCKET_URL,
  },
  security: {
     hashPasswordRounds: parseInt(process.env.HASH_PASSWORD_ROUNDS),
     defaultManagerPassword: process.env.DEFAULT_MANAGER_PASSWORD,
     admin_email: process.env.ADMIN_EMAIL,
     manager_email: process.env.MANAGER_EMAIL,
    max_profanity_edits: parseInt(process.env.MAX_PROFANITY_EDITS)
  },
  sendGrid: {
    api_key: process.env.SENDGRID_API_KEY,
    from_email: process.env.SENDGRID_FROM_EMAIL,
    front_url: process.env.FRONT_URL
  },
  actionToken: {
    setup_manager_secret: process.env.ACTION_TOKEN_SETUP_MANAGER_SECRET,
    setup_manager_expires_in: process.env.ACTION_TOKEN_SETUP_MANAGER_EXPIRES_IN,
    forgot_password_secret: process.env.ACTION_TOKEN_FORGOT_PASSWORD_SECRET,
    forgot_password_expires_in: process.env.ACTION_TOKEN_FORGOT_PASSWORD_EXPIRES_IN,
  },
   exchangeRates: {
    api_privatbank: process.env.API_PRIVATBANK
   }
});
