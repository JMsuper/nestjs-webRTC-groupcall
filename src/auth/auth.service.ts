import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from '../common/payload';
import { CreateUserDto, LoginDto, PasswordUpdateUserDto, UserBaseDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService, 
        private jwtService: JwtService
    ){}

    /**
     * @throws BadRequestException("Duplicated email")
     */
    async signUp(createUserDto: CreateUserDto): Promise<UserBaseDto>{
        var {email, password, name} = createUserDto;

        const foundUser: UserBaseDto = await this.userService.findOneByEmail(createUserDto.email)

        if(this.userService.isDuplicatedEmail(foundUser,createUserDto.email)){
            throw new BadRequestException("Duplicated email");
        }

        password = await this.encryptPassword(password);

        var userBaseDto: UserBaseDto = new UserBaseDto();
        userBaseDto.email = email;
        userBaseDto.password = password;
        userBaseDto.name = name;

        const createdUser: UserBaseDto = await this.userService.save(userBaseDto);

        return createdUser;
    }

    async signIn(loginDto: LoginDto): Promise<any>{
        const {email, password} = loginDto;
        const user: UserBaseDto = await this.userService.findOneByEmail(email);

        await this.verifyPassword(user, password);

        const accessTokenPayload: AccessTokenPayload = {userId: user.id, email: user.email};
        const refreshTokenPayload: RefreshTokenPayload = {userId: user.id};

        return {
            access_token: await this.jwtService.signAsync(accessTokenPayload, {expiresIn: '30m'}),
            refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {expiresIn: '1h'})
        }
    }

    async updatePassword(passwordUpdateUserDto: PasswordUpdateUserDto){
        const {email, password, newPassword} = passwordUpdateUserDto;

        const user: UserBaseDto = await this.userService.findOneByEmail(email);
        await this.verifyPassword(user, password);

        user.password = newPassword;
        user.password = await this.encryptPassword(user.password);
        
       await this.userService.save(user);
    }

    async encryptPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, 10);
    }

    /**
     * @throws UnauthorizedException, if email not exist or password not correct
     */
    async verifyPassword(user: UserBaseDto, password: string){
        console.log(user, password);
        if( ! user || ! await bcrypt.compare(password,user.password)){
            throw new UnauthorizedException("Email not exist, or password not correct");
        }
    }

}
