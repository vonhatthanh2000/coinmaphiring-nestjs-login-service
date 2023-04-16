import { APP_NAME, NODE_ENV } from '@environments';
import { format, transports, Logform } from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';

const formatter = (): Logform.Format => {
  if (NODE_ENV === 'production') {
    return format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    );
  }

  return format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    nestWinstonModuleUtilities.format.nestLike(APP_NAME, {
      colors: true,
      prettyPrint: true,
    }),
  );
};

export const WinstonConfig: WinstonModuleOptions = {
  level: 'info',
  format: formatter(),
  transports: [
    new transports.Console({
      level: 'info',
      silent: NODE_ENV === 'test',
    }),
  ],
};
