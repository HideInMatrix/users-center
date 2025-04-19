import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService,private readonly configService:ConfigService) {}

  async sendWelcomeEmail(userEmail: string, name: string, verifyToken:string): Promise<void> {
    const verificationUrl = `${this.configService.get("DASHBOARD_URL")}/v1/users/verify-email/${verifyToken}`
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Acctivation Email',
        template: './register', // 对应模板文件名（无需扩展名）
        context: { name ,verificationUrl}, // 模板变量
      });
    } catch (error) {
      console.error('邮件发送失败:', error);
      throw new Error('邮件发送失败');
    }
  }
  
}