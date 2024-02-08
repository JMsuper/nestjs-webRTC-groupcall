import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UserRepository } from './user.repository';
import { NameUpdateUserDto, UserBaseDto } from './user.dto';
import { BadRequestException } from '@nestjs/common';
import { User } from './user.entity';


const mockRepository = {
  findOneBy : jest.fn(),
  create : jest.fn(),
  save : jest.fn(),
  softRemove : jest.fn()
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

  describe('save', () => {

    it('Given_UserBaseDto_When_Save_Then_SaveUser', async () => {
      //given
      const user = new User();
      user.email = "email@naver.com";
      user.name = "name";
      user.password = "1234";

      const userBaseDto = UserBaseDto.of(user);

      jest.spyOn(userRepository,'create').mockReturnValue(user);
      jest.spyOn(userRepository,'save').mockResolvedValue(user);
    
      //when
      const result = await userService.save(userBaseDto);
  
      //then
      expect(result.email).toEqual(userBaseDto.email);
    });

  })

  describe('findOneById', () => {

    it('Given_NotExistEmail_When_FindOneById_Then_ReturnNull', async () => {
      //given
      jest.spyOn(userRepository,'findOneBy').mockReturnValue(null);
      const notExistId = 1;
  
      //when
      const result = await userService.findOneById(notExistId);
  
      //then
      expect(result).toBeNull();
    });

  })

  describe('findOneByEmail', () => {

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

    it('Given_User_When_UpdateName_Then_UpdatedName', async () => {
      //given
      const id = 1;
      const name = "name";
      const newName = "newName";

      const user = new User();
      user.id = id;
      user.name = name;

      const updatedUser = new User();
      updatedUser.id = id;
      updatedUser.name = newName;

      const dto = new NameUpdateUserDto();
      dto.id = id;
      dto.name = newName;

      jest.spyOn(userRepository,'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository,'save').mockResolvedValue(updatedUser);

      //when
      const result = await userService.updateName(dto);

      //then
      expect(result.name).toEqual(newName);
    });

    it('Given_NoUser_When_UpdateName_Then_ThrowBadRequestException', async () => {
      //given
      jest.spyOn(userRepository,'findOneBy').mockReturnValue(null);
      const dto = new NameUpdateUserDto();
  
      //when
      //then
      expect(async () => await userService.updateName(dto)).rejects.toThrow(BadRequestException);
    });

  })

  describe('deleteUser', () => {

    it('Given_ExistUserId_When_DeletedUser_Then_Null', async () => {
      //given
      const id = 1;
      const user = new User();
      user.id = 1;

      const removedUser = new User();
      user.id = 1;
      user.deletedAt = new Date();
      
      jest.spyOn(userRepository,'findOneBy').mockResolvedValue(user);
      jest.spyOn(userRepository,'softRemove').mockResolvedValue(removedUser);
  
      //when
      const result = await userService.deleteUser(id);
  
      //then
      expect(result).toBeUndefined();
    });

    it('Given_NotExistUserId_When_DeletedUser_Then_ThrowBadRequestException', async () => {
      //given
      const id = 1;

      jest.spyOn(userRepository,'findOneBy').mockResolvedValue(null);
  
      //when
      //then
      expect( async () => await userService.deleteUser(id)).rejects.toThrow(BadRequestException);
    });

  })

  describe('isDuplicatedEmail', () => {

    it('Given_ExistUser_When_IsDuplicatedEmail_Then_True', async () => {
      //given
      const email = "email@gmail.com";
      const dto: UserBaseDto = new UserBaseDto();
      dto.email = email;
  
      //when
      const result = userService.isDuplicatedEmail(dto, email);
  
      //then
      expect(result).toEqual(true);
    });
    
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
