import { Global, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger();

  public log(message: string): void {
      this.logger.log(message);
  }
  public error(error: any): void {
      this.logger.error(error, error.stack);
  }
}
