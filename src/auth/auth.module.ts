import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule} from '@nestjs/jwt';
import { jwtConstants } from '../common/constants';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret
  })],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
