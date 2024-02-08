import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { GroupModule } from './group/group.module';

@Module({
  imports: [UserModule, AuthModule, CommonModule, TypeOrmModule.forRoot(typeormConfig), GroupModule],
})
export class AppModule {}
