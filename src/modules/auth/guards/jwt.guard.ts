import { RequestWithAuth } from '@interfaces';
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
  }

  /* eslint-disable-next-line */
  // @ts-ignore
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean | Observable<boolean>> {
    try {
      return super.canActivate(context);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  getRequest(context: ExecutionContext): RequestWithAuth {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
  }
}
