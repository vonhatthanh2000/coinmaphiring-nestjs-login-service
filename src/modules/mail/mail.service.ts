import { User } from '@entities';
import { MAIL_VERIFY_CALLBACK, MAIL_VERIFY_HOST } from '@environments';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import path from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmationEmail(user: User, token: string) {
    const url = `${MAIL_VERIFY_HOST}/auth/verify/${
      user.id
    }-${token.toLowerCase()}?redirectTo=${MAIL_VERIFY_CALLBACK}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Pikasso! Confirm your Email',
      template: path.join(
        __dirname,
        '../config/mail/templates/confirmation.hbs',
      ),
      context: {
        name: user.username,
        url,
      },
    });
  }
}
