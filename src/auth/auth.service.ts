import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RefreshTokenPayload } from '../common/payload';
import { CreateUserDto, LoginDto, NoPasswordUserDto, PasswordUpdateUserDto, UserBaseDto } from '../user/user.dto';
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
    async signUp(createUserDto: CreateUserDto): Promise<NoPasswordUserDto>{
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

        const result = await this.userService.save(userBaseDto);

        return NoPasswordUserDto.of(result);
    }

    async signIn(loginDto: LoginDto): Promise<any>{
        const {email, password} = loginDto;
        const user: UserBaseDto = await this.userService.findOneByEmail(email);

        await this.verifyPassword(user, password);

        return this.generateAccessAndRefreshToken(user.id);
    }

    async generateAccessAndRefreshToken(userId: number){
        const user: UserBaseDto = await this.userService.findOneById(userId);

        const accessTokenPayload: AccessTokenPayload = {userId: user.id, email: user.email};
        const refreshTokenPayload: RefreshTokenPayload = {userId: user.id};

        return {
            access_token: await this.jwtService.signAsync(accessTokenPayload, {expiresIn: '2h'}),
            refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {expiresIn: '4h'})
        }
    }

    async updatePassword(passwordUpdateUserDto: PasswordUpdateUserDto): Promise<UserBaseDto>{
        const {email, password, newPassword} = passwordUpdateUserDto;

        const user: UserBaseDto = await this.userService.findOneByEmail(email);
        await this.verifyPassword(user, password);

        user.password = newPassword;
        user.password = await this.encryptPassword(user.password);
        
       return this.userService.save(user);
    }

    async encryptPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, 10);
    }

    /**
     * @throws UnauthorizedException, if email not exist or password not correct
     */
    async verifyPassword(user: UserBaseDto, password: string){
        if( ! user || ! await bcrypt.compare(password,user.password)){
            throw new UnauthorizedException("Email not exist, or password not correct");
        }
    }

}
