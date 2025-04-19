
## Description

用户中心

## Support

1. 用户认证
2. 用户授权
3. 接口返回统一
4. prisma ORM操作数据库
5. eslint 代码检测
6. 代码自动化测试
7. 接口访问频率(暂时用不使用redis实现)
8. 定时删除任务

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# init prisma
npx prisma generate
# create db if you need
npx prisma db push

```

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```


## 开发

1. @nestjs/throttler 模块限制用户短时间内重复请求验证邮件的频率
2. @nestjs/schedule 模块定期清理

## License

Nest is [MIT licensed](LICENSE).
