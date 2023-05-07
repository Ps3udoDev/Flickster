declare namespace NodeJs {
  interface ProcessEnv {
    PORT: number;
    NODE_ENV: string;

    JWT_SECRET_WORD: string;

    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;

    MAIL_SEND: string;
    DOMAIN: string;
    PASSWORD_RESET_DOMAIN: string;

    NODEMAILER_HOST: string;
    NODEMAILER_USER: string;
    NODEMAILER_PASSWORD: string;

    AWS_BUCKET_NAME: string;
    AWS_BUCKET_REGION: string;
    AWS_ACCESS_KEY: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_DOMAIN: string;
  }
}
