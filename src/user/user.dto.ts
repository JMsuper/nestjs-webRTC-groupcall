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

export class CreateUserDto extends OmitType(UserBaseDto, ['id']){
    toUserBaseDto(){
        const userBaseDto: UserBaseDto = new UserBaseDto();
        userBaseDto.email = this.email;
        userBaseDto.name = this.name;
        userBaseDto.password = this.password;
        return userBaseDto;
    }
}

export class NoPasswordUserDto extends OmitType(UserBaseDto, ['password']){}

export class NameUpdateUserDto extends PickType(UserBaseDto, ['id','name']){}

export class PasswordUpdateUserDto extends OmitType(UserBaseDto, ['id']){
    @IsString()
    @MinLength(8)
    newPassword: string;
}