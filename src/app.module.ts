import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from '@config';
import { AuthModule, MailModule, UserModule } from '@modules';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    MailModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
