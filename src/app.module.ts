import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@microservice-user/module-database/database.module';
import { LoggerModule } from '@microservice-user/module-log/logs.module';
import { AuthModule } from '@microservice-user/module-auth/auth.module';
import { UserModule } from '@microservice-user/module-user/user.module';

import { LoggerMiddleware } from '@microservice-user/config-middlewares';
import { TransformInterceptor } from '@microservice-user/config-interceptors';
import { AllExceptionsFilter } from '@microservice-user/config-exceptions';

import { AppController } from './app.controller';
import { AppService } from './app.service';
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  imports: [LoggerModule, ConfigModule, DatabaseModule, AuthModule, UserModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
