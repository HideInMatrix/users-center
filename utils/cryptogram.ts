import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();


/**
 * Encrypt password
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(password: string): string {
  if (!password) {
    return '';
  }
  const salt = configService.get('AUTH_SECRET') || 'secret';
  const tempSalt = Buffer.from(salt, 'base64');
  return (
    // 10000 代表迭代次数 16代表长度
    crypto.pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1').toString('base64')
  );
}
