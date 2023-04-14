import { MAIL_HOST, MAIL_PASSWORD, MAIL_USER } from '@environments';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
  createMailerOptions() {
    return {
      transport: {
        host: MAIL_HOST,
        secure: false,
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `'hello' from ${MAIL_USER}`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
