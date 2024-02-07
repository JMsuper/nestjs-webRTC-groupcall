import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, NameUpdateUserDto, NoPasswordUserDto, PasswordUpdateUserDto, UserBaseDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class UserService {

    constructor(private userRepository: UserRepository){}

    async save(userBaseDto: UserBaseDto): Promise<UserBaseDto>{
        const user = this.userRepository.create(userBaseDto);
        const savedUser = await this.userRepository.save(user);
        return UserBaseDto.of(savedUser);
    }

    async findOneById(userId: number): Promise<UserBaseDto>{
        const foundUser: User = await this.userRepository.findOneBy({id:userId});
        return foundUser !== null ? UserBaseDto.of(foundUser) : null;
    }

    async findOneByEmail(email: string): Promise<UserBaseDto>{
        const foundUser: User = await this.userRepository.findOneBy({email});
        return foundUser !== null ? UserBaseDto.of(foundUser) : null;
    }

    async updateName(nameUpdateUserDto: NameUpdateUserDto){
        const {id, name} = nameUpdateUserDto;
        const user: User = await this.userRepository.findOneBy({id});

        if(!user){
            throw new BadRequestException("Not exist Id : ${id}");
        }
        user.name = name;
        const updatedUser = await this.userRepository.save(user);
        return UserBaseDto.of(updatedUser);
    }

    isDuplicatedEmail(user: UserBaseDto, email: string): boolean {
        if(user?.email === email){
            return true;
        }
        return false;
    }
}
