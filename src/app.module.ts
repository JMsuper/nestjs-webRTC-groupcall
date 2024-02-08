import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { CodeModule } from './code/code.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { JoingroupModule } from './joingroup/joingroup.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production'
    }),UserModule, AuthModule, CommonModule, TypeOrmModule.forRoot(typeormConfig), TeamModule, CodeModule, JoingroupModule],
})
export class AppModule {}
