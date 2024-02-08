import { OmitType, PartialType, PickType } from "@nestjs/mapped-types";
import { IsString, Matches, MinLength } from "class-validator";
import { User } from "./user.entity";

export class UserBaseDto{

    id: number;

    @IsString()
    @Matches(/\w+@\w+\.\w+(\.\w+)?/,{
        message: "not email format"
    })
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    name: string;

    static of = (user: User) => {
        const userBaseDto: UserBaseDto = new UserBaseDto();
        userBaseDto.id = user.id;
        userBaseDto.email = user.email;
        userBaseDto.name = user.name;
        userBaseDto.password = user.password;
        return userBaseDto;
    }
}

export class LoginDto extends PickType(UserBaseDto, ['email','password']){}

export class CreateUserDto extends OmitType(UserBaseDto, ['id']){}

export class NoPasswordUserDto extends OmitType(UserBaseDto, ['password']){
    static of = (user: UserBaseDto) => {
        const dto: NoPasswordUserDto = new NoPasswordUserDto();
        dto.id = user.id;
        dto.email = user.email;
        dto.name = user.name;
        return dto;
    }
}

export class NameUpdateUserDto extends OmitType(UserBaseDto, ['email','password']){}

export class PasswordUpdateUserDto extends OmitType(UserBaseDto, ['id','name']){
    @IsString()
    @MinLength(8)
    newPassword: string;
}