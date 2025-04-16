import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '@nestjs/common';

export interface JwtMiddlewareOptions {
  secret?: string;
  algorithms?: string[];
  tokenFromRequest?: (req: Request) => string | null;
  ignoreExpiration?: boolean;
  passthrough?: boolean;
}

export interface JwtPayload {
  sub?: string;
  [key: string]: any;
}

export class JwtMiddleware {
  private readonly jwtService: JwtService;
  private readonly options: JwtMiddlewareOptions;

  constructor(options: JwtMiddlewareOptions = {}) {
    // 确保 options 对象存在并设置默认值
    const defaultOptions: JwtMiddlewareOptions = {
      algorithms: ['HS256'],
      ignoreExpiration: false,
      passthrough: false,
    };

    this.options = {
      ...defaultOptions,
      ...options,
    };

    // 确保 algorithms 数组存在且不为空
    if (!this.options.algorithms || this.options.algorithms.length === 0) {
      this.options.algorithms = ['HS256'];
    }

    this.jwtService = new JwtService({
      secret: this.options.secret || 'default-secret', // 提供默认密钥
      signOptions: {
        algorithm: this.options.algorithms[0] as 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512',
      },
    });
  }

  private extractToken(req: Request): string | null {
    if (this.options.tokenFromRequest) {
      return this.options.tokenFromRequest(req);
    }

    if (req.headers.authorization?.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }

    if (req.query.token) {
      return req.query.token as string;
    }

    if (req.cookies?.token) {
      return req.cookies.token;
    }

    return null;
  }

  // Express 中间件
  public expressMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = this.extractToken(req);

      if (!token && !this.options.passthrough) {
        throw new UnauthorizedException('No token provided');
      }

      if (token) {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: this.options.secret,
          ignoreExpiration: this.options.ignoreExpiration,
        });
        // 将用户信息存储在请求对象的自定义属性中
        (req as unknown as { user: JwtPayload }).user = payload;
      }

      next();
    } catch (error) {
      if (this.options.passthrough) {
        next();
      } else {
        next(new UnauthorizedException('Invalid token'));
      }
    }
  };

  // Koa 中间件
  public koaMiddleware = async (ctx: any, next: () => Promise<void>) => {
    try {
      const token = this.extractToken(ctx.req);

      if (!token && !this.options.passthrough) {
        ctx.throw(401, 'No token provided');
      }

      if (token) {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: this.options.secret,
          ignoreExpiration: this.options.ignoreExpiration,
        });
        ctx.state.user = payload;
      }

      await next();
    } catch (error) {
      if (this.options.passthrough) {
        await next();
      } else {
        ctx.throw(401, 'Invalid token');
      }
    }
  };

  // 通用验证方法
  public async verify(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.options.secret,
      ignoreExpiration: this.options.ignoreExpiration,
    });
  }
}
