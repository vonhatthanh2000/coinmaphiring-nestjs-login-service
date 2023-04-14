import { MailConfigService } from '@config';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [MailerModule.forRootAsync({ useClass: MailConfigService })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
