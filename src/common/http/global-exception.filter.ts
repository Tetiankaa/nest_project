import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../modules/logger/logger.service';
import { statusCodes } from '../constants/status-codes.constant';
import { errorMessages } from '../constants/error-messages.constant';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggerService: LoggerService,
  ) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let messages: string | string[];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      messages = (exception as HttpException).message;
    } else {
      status = statusCodes.INTERNAL_SERVER_ERROR;
      messages =  errorMessages.INTERNAL_SERVER_ERROR;
    }

    this.loggerService.error(exception);

    messages = Array.isArray(messages) ? messages : [messages];

    response.status(status).json({
      messages,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
