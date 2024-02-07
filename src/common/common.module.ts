import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.auth.guard';
import { RefreshAuthGuard } from './refresh.auth.guard';

@Module({
    providers:[
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        },
        RefreshAuthGuard
    ],
    exports: [RefreshAuthGuard]
})
export class CommonModule {}
