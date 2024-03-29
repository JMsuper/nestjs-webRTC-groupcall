import { BadRequestException, Injectable } from '@nestjs/common';
import { NameUpdateUserDto, UserBaseDto } from './user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';


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
            throw new BadRequestException(`Not exist Id : ${id}`);
        }
        user.name = name;
        const updatedUser = await this.userRepository.save(user);
        return UserBaseDto.of(updatedUser);
    }

    async deleteUser(userId: number){
        const user: User = await this.userRepository.findOneBy({id: userId});

        if(!user){
            throw new BadRequestException(`Not exist Id : ${userId}`);
        }

        await this.userRepository.softRemove(user);
    }

    isDuplicatedEmail(user: UserBaseDto, email: string): boolean {
        if(user?.email === email){
            return true;
        }
        return false;
    }
}
