
## Description

用户中心

## Support

1. 用户认证
2. 用户授权
3. 接口返回统一
4. prisma ORM操作数据库
5. eslint 代码检测
6. 代码自动化测试

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

## License

Nest is [MIT licensed](LICENSE).
