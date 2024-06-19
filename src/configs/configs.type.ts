export type Configs = {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  aws: AWSConfig;
  security: SecurityConfig;
  sendGrid: SendGridConfig,
  actionToken: ActionTokenConfig
};

export type AppConfig = {
  port: number;
  host: string;
};
export type DatabaseConfig = {
  port: number;
  host: string;
  username: string;
  password: string;
  db_name: string;
};
export type RedisConfig = {
  port: number;
  host: string;
  password: string;
};
export type JWTConfig = {
  access_secret: string;
  refresh_secret: string;
  access_expires_in: number;
  refresh_expires_in: number;
};
export type AWSConfig = {
  region: string;
  endpoint: string;
  accessKey: string;
  secretAccessKey: string;
  bucketName: string;
  bucketUrl: string;
};
export type SecurityConfig = {
  hashPasswordRounds: number;
  defaultManagerPassword: string;
};
export type SendGridConfig = {
  api_key: string;
  front_url: string;
  from_email: string;
}
export type ActionTokenConfig = {
  setup_manager_secret: string;
  setup_manager_expires_in: string;
  forgot_password_secret: string;
  forgot_password_expires_in: string;
}
