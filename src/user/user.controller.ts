import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserDto, UserBaseDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @HttpCode(HttpStatus.CREATED)
    @Post('/')
    async register(@Body() createUserDto:CreateUserDto){
        // const userBaseDto: UserBaseDto = await this.userService.createUser(createUserDto);
        // return userBaseDto;
    }
    
    // @Get('/:id')
    // getUserInfo(@Param('id') requestId){
    //      this.userService.findOne(requestId);
    // }

    // @Patch('/profile')
    // async updateProfile(@Body() userUpdateDto: ProfileUpdateDto, @Req() req){
    //     const userId = req.user.userId;
        
    //     if(Object.keys(userUpdateDto).length === 0){
    //         throw new BadRequestException("업데이트 정보를 입력해주세요.");
    //     }

    //     const result: boolean = await this.userService.updateProfile(userUpdateDto, userId);
    //     return {success: result};
    // }

    // @Delete('/:id')
    // async deleteUser(@Param('id') id: number, @Req() req){
    //     const userId = req.user.userId;
    //     if(id != userId){
    //         throw new UnauthorizedException("해당 사용자를 삭제할 권한이 없습니다.");
    //     }
    //     const result = await this.userService.deleteUser(userId);
    //     return {success: result};
    // }
}
