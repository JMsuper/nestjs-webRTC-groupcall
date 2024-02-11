import { BadRequestException, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Req, UnauthorizedException, } from '@nestjs/common';
import { UserService } from './user.service';
import { JoingroupService } from '../joingroup/joingroup.service';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private joinGroupService: JoingroupService
    ){}
    
    @HttpCode(HttpStatus.OK)
    @Get('/:id')
    async getUserInfo(@Param('id', ParseIntPipe) requestId: number){
        const user = await this.userService.findOneById(requestId);

        if(!user){
            throw new BadRequestException(`not exist user id : ${requestId}`);
        }
        const {password, ...result} = user;
        
        return result;
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/:id')
    async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req){
        const userId = req.userId;
        if(id != userId){
            throw new UnauthorizedException("해당 사용자를 삭제할 권한이 없습니다.");
        }
        await this.userService.deleteUser(id);
        return {success: "success"};
    }

    @Get('/:id/joinGroup')
    async getJoinGroup(@Param('id', ParseIntPipe) id: number, @Req() req){
        const userId = req.userId;
        if(id != userId){
            throw new UnauthorizedException("해당 사용자의 그룹을 조회할 권한이 없습니다.");
        }
        return this.joinGroupService.getJoinedGroupList(id);
    }

}
