import { randomUUID } from 'node:crypto';
import * as path from 'node:path';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AWSConfig, Configs } from '../../../configs/configs.type';
import { LoggerService } from '../../logger/services/logger.service';
import { ContentTypeEnum } from '../models/enums/content-type.enum';

@Injectable()
export class FileStorageService {
  private readonly awsConfig: AWSConfig;
  private client: S3Client;

  constructor(
    private readonly configService: ConfigService<Configs>,
    private readonly logger: LoggerService,
  ) {
    this.awsConfig = this.configService.get<AWSConfig>('aws');
    const params: S3ClientConfig = {
      region: this.awsConfig.region,
      credentials: {
        secretAccessKey: this.awsConfig.secretAccessKey,
        accessKeyId: this.awsConfig.accessKey,
      },
    };

    if (this.awsConfig.endpoint) {
      params.forcePathStyle = true;
      params.endpoint = this.awsConfig.endpoint;
    }
    this.client = new S3Client(params);
  }

  public async uploadFile(
    file: Express.Multer.File,
    itemType: ContentTypeEnum,
    itemId: string,
  ): Promise<string> {
    try {
      const path = this.buildPath(itemType, itemId, file.originalname);
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: path,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      return path;
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: filePath,
        }),
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  private buildPath(
    itemType: ContentTypeEnum,
    itemId: string,
    fileName: string,
  ): string {
    return `${itemType}/${itemId}/${randomUUID()}${path.extname(fileName)}`;
  }
}
