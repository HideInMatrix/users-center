import { randomBytes } from "crypto";

/**
 * @Author: HideInMatrix
 * @description: 自定义序列化函数，解决雪花id无法被序列化的问题
 * @param {string} key
 * @param {any} value
 * @return {*}
 * @Date: 2024-09-23
 */
export const replacer = (key: string, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
  };

  export const generateToken = (): string => {
    return randomBytes(32).toString('hex'); // 生成 64 字符的随机字符串
  };
  
  export const getExpirationTime = (hours: number): Date => {
    const now = new Date();
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  };