import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

@Module({
    providers: [MailService],
    imports: [
      ConfigModule,
      MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          transport: {
            host: config.get('MAIL_HOST'),
            port: config.get('MAIL_PORT'),
            secure: true, // 是否使用 TLS (通常 465 端口为 true)
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"laituba" <${config.get('MAIL_USER')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'), // 模板文件目录
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }),
        inject: [ConfigService],
      }),
    ],
    exports: [MailService,MailerModule],
  })
  export class MailModule {}