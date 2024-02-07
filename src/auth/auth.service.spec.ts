import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserBaseDto } from '../user/user.dto';
import { jwtConstants } from '../common/constants';

const mockUserService = {
  findOneByEmail : jest.fn(),
  findMyProfile : jest.fn()
}

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '60s'}
          })],
        providers: [AuthService, {provide: UserService, useValue:mockUserService}]
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = await module.resolve(JwtService);
  });

  describe('encryptPassword', ()=>{
    
    it('Given_String_When_EncryptPassword_Then_EncryptedPassword', async ()=>{
      //given
      const password = "1234";

      //when
      const encryptPassword = await authService.encryptPassword(password);

      //then
      expect(encryptPassword).not.toEqual(password);
    });
  
  });

  describe('verifyPassword', () => {

    it('Given_NoUser_When_VerifyPassword_Then_ThrowUnauthorizedException', async () => {
      //given
      const user = null;
      const password = await authService.encryptPassword("1234");
  
      //when
      //then
      expect(async () => await authService.verifyPassword(user,password))
      .rejects.toThrow(UnauthorizedException);
    });
  
    it('Given_NoEncryptedPassword_When_VerifyPassword_Then_ThrowUnauthorizedException', async () => {
      //given
      const user: UserBaseDto = new UserBaseDto();
      user.password = "1234";
      const password = await authService.encryptPassword("1234");

      //when
      //then
      expect(async () => await authService.verifyPassword(user,password)).rejects.toThrow(UnauthorizedException);
    });
  
    it('Given_EncryptedPassword_When_VerifyPassword_Then_Void', async () => {
      //given
      const user: UserBaseDto = new UserBaseDto();
      user.password = await authService.encryptPassword("1234");
      const password = await authService.encryptPassword("1234");
  
      //when
      const result = await authService.verifyPassword(user,password);
  
      //then
      expect(result).toBeUndefined();
    });

  })
});
