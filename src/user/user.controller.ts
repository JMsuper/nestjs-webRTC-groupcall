import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserDto, UserBaseDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}
    
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    async getUserInfo(@Param('id') requestId){
        const user = await this.userService.findOneById(requestId);

        if(!user){
            throw new BadRequestException("not exist user id");
        }
        const {password, ...result} = user;
        
        return result;
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/:id')
    async deleteUser(@Param('id') id: number, @Req() req){
        const userId = req.user.userId;
        if(id != userId){
            throw new UnauthorizedException("해당 사용자를 삭제할 권한이 없습니다.");
        }
        await this.userService.deleteUser(userId);
        return {success: "success"};
    }
}
