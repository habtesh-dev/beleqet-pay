import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    // Never leak stack traces or provider secrets to API consumers.
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    res.status(status).json({
      statusCode: status,
      error: typeof message === 'string' ? message : (message as any).message ?? message,
      timestamp: new Date().toISOString(),
    });
  }
}
