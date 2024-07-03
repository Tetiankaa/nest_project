import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';
import { MailDataRequired } from "@sendgrid/helpers/classes/mail";

import { Configs, SendGridConfig } from '../../configs/configs.type';
import { LoggerService } from '../logger/logger.service';
import { EEmailType } from './enums/email-type.enum';
import { EmailPayloadType } from './types/email-payload.type';
import { emailTemplateConstants } from './constants/email-template.constants';

@Injectable()
export class EmailService {
  private readonly sendGridConfig: SendGridConfig;

  constructor(private readonly configService: ConfigService<Configs>,
              private readonly loggerService: LoggerService
              ) {
    this.sendGridConfig = this.configService.get<SendGridConfig>('sendGrid');
    SendGrid.setApiKey(this.sendGridConfig.api_key)
  }

  public async sendByEmailType<T extends EEmailType>(
    emailType: T,
    dynamicTemplateData: EmailPayloadType[T],
    recipient: string,
  ): Promise<void> {
    try {
      const templateId = emailTemplateConstants[emailType].templateId;
      await this.send({
        from: this.sendGridConfig.from_email,
        to: recipient,
        templateId,
        dynamicTemplateData,
      });
    } catch (e) {
      this.loggerService.error(e.response ? e.response.body.errors : e.message)
    }
  }
  private async send(email: MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(email);
    } catch (e) {
      this.loggerService.error(e.response ? e.response.body.errors : e.message)
    }
  }
}
