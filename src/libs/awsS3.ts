import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

ConfigModule.forRoot({
  envFilePath: '.env',
});

const configService = new ConfigService();

const bucketName = configService.get('AWS_BUCKET_NAME');
const region = configService.get('AWS_BUCKET_REGION');
const accessKeyId = configService.get('AWS_ACCESS_KEY');
const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');

const s3 = new S3({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const uploadFile = async (file: Express.Multer.File, name: string) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: name,
    ContentType: file.mimetype,
  };

  await s3.putObject(uploadParams).promise();
  return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
};

export const deleteFile = async (name: string) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: name,
  };
  await s3.deleteObject(deleteParams).promise();
};

export const getMail = async (name: string) => {
  const params = {
    Bucket: bucketName,
    Key: `public/mails/${name}.html`,
  };
  const content = await s3.getObject(params).promise();
  return content.Body;
};
