/*
 * @Author: HideInMatrix
 * @Date: 2024-09-22
 * @LastEditors: HideInMatrix
 * @LastEditTime: 2024-09-22
 * @Description: 雪花id生成
 * @FilePath: /cosplay-next/lib/snowflake-id.ts
 */

import { SnowflakeIdv1 } from 'simple-flakeid';

// 创建 Snowflake 实例
const snowflake = new SnowflakeIdv1({ workerId: 1 });

// 生成 ID
export const generateId = () => {
  return snowflake.NextNumber();
};
