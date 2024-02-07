import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UserRepository } from './user.repository';
import { NameUpdateUserDto, UserBaseDto } from './user.dto';
import { BadRequestException } from '@nestjs/common';


const mockRepository = {
  findOneBy : jest.fn()
}

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {provide: UserRepository, useValue: mockRepository}],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('findOneById', () => {

    it('Given_NotExistEmail_When_FindOneById_Then_ReturnNull', async () => {
      //given
      jest.spyOn(userRepository,'findOneBy').mockReturnValue(null);
      const notExistEmail = "email@gmail.com";
  
      //when
      const result = await userService.findOneByEmail(notExistEmail);
  
      //then
      expect(result).toBeNull();
    });

  })

  describe('updateName', () => {

    it('Given_NoUser_When_UpdateName_Then_ThrowBadRequestException', async () => {
      //given
      jest.spyOn(userRepository,'findOneBy').mockReturnValue(null);
      const dto = new NameUpdateUserDto();
  
      //when
      //then
      expect(async () => await userService.updateName(dto)).rejects.toThrow(BadRequestException);
    });

  })

  describe('isDuplicatedEmail', () => {
    
    it('Given_NoUser_When_IsDuplicatedEmail_Then_False', async () => {
      //given
      const notExistEmail = "email@gmail.com";
      const dto = null;
  
      //when
      const result = userService.isDuplicatedEmail(dto, notExistEmail);
  
      //then
      expect(result).toEqual(false);
    });

  })

});
