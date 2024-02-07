import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Request, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SkipAuth } from './auth-meta';
import { CreateUserDto, LoginDto, PasswordUpdateUserDto, UserBaseDto } from '../user/user.dto';
import { Response } from 'express';
import { RefreshAuthGuard } from '../common/refresh.auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}


    @HttpCode(HttpStatus.CREATED)
    @SkipAuth()
    @Post('/register')
    async register(@Body() createUserDto: CreateUserDto){
        return this.authService.signUp(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @SkipAuth()
    @Post('login')
    async signIn(@Body() loginDto: LoginDto, @Res() res: Response){
        const {access_token, refresh_token} = await this.authService.signIn(loginDto);
        
        res.setHeader('Authorization', 'Bearer ' + [access_token]);
        res.cookie('refreshToken', refresh_token,{httpOnly: true});

        return res.send({success : true})
    }

    @HttpCode(HttpStatus.CREATED)
    @Patch('/password')
    async updatePassword(@Body() passwordUpdateUserDto: PasswordUpdateUserDto){
        await this.authService.updatePassword(passwordUpdateUserDto);
        return {sucess: true};
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshAuthGuard)
    @SkipAuth()
    @Post('/refresh')
    async refresh(@Req() req, @Res() res){
        const userId = req.userId;
        const {access_token, refresh_token} = await this.authService.generateAccessAndRefreshToken(userId);
        
        res.setHeader('Authorization', 'Bearer ' + [access_token]);
        res.cookie('refreshToken', refresh_token,{httpOnly: true});

        return res.send({success : true})
    }
}
