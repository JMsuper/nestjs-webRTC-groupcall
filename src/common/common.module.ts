import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.auth.guard';
import { RefreshAuthGuard } from './refresh.auth.guard';
import { AppLoggerMiddleware } from './app-logger';

@Global()
@Module({
    providers:[
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        },
        RefreshAuthGuard,
        AppLoggerMiddleware
    ],
    exports: [RefreshAuthGuard,AppLoggerMiddleware]
})
export class CommonModule {}
