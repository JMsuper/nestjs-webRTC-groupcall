import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserBaseDto } from '../user/user.dto';
import { jwtConstants } from '../common/constants';

const mockUserService = {
  findOneByEmail : jest.fn(),
  findOneById : jest.fn(),
  findMyProfile : jest.fn(),
  save : jest.fn()
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

  describe('signIn', ()=>{
    
    it('Given_CorrectLoginInfo_When_SignIn_Then_Tokens', async ()=>{
      //given
      const email = "email@g.naver";
      const password = '1234';
      const encryptPassword = await authService.encryptPassword(password);

      const userBaseDto = new UserBaseDto();
      userBaseDto.id = 1;
      userBaseDto.email = email;
      userBaseDto.password = encryptPassword;

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(userBaseDto);
      jest.spyOn(userService, 'findOneById').mockResolvedValue(userBaseDto);

      //when
      const result = await authService.signIn({email, password});

      //then
      expect(result.access_token).toBeTruthy()
      expect(result.refresh_token).toBeTruthy()
      expect(result.access_token).not.toEqual(result.refresh_token);
    });
  
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
      const password = "1234";
  
      //when
      const result = await authService.verifyPassword(user,password);
  
      //then
      expect(result).toBeUndefined();
    });

  })
});
