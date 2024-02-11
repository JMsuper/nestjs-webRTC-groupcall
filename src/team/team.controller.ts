import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Patch, Post, Req } from '@nestjs/common';
import { TeamService } from './team.service';
import { ChangeRoleDto, CreateTeamDto, TeamJoinDto, TeamMemberSelectDto, UpdateTeamDto } from './team.dto';
import { JoingroupService } from '../joingroup/joingroup.service';

@Controller('team')
export class TeamController {
    constructor(
        private teamService: TeamService,
        private joinGroupService: JoingroupService
    ){}

    @Get('/:teamId')
    async getTeamInfo(@Param('teamId') teamId: number, @Req() req){
        const userId = req.userId;
        return this.teamService.getTeamWithUser(userId,teamId);
    }

    @Post()
    async createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req){
        const userId = req.userId;
        return this.teamService.createTeam(createTeamDto, userId);
    }

    @Post('/join')
    async joinTeam(@Body() teamJoinDto: TeamJoinDto, @Req() req){
        const {code} = teamJoinDto;
        const userId = req.userId;
        const {teamId, isOwner} = await this.joinGroupService.joinTeamWithCode(code, userId);
        return {teamId, isOwner};
    }

    @Post('/:teamId/exit')
    async exitTeam(@Param() teamId: number, @Req() req){
        const userId = req.userId;
        await this.joinGroupService.exitTeam(teamId, userId);
        return {sucess:true};
    }

    @Patch()
    async updateTeam(@Body() updateTeamDto:UpdateTeamDto, @Req() req){
        const userId = req.userId;
        return this.teamService.updateTeam(updateTeamDto, userId);
    }

    @Delete('/:teamId')
    async deleteTeam(@Param('teamId') teamId: number, @Req() req){
        const userId = req.userId;
        await this.teamService.deleteTeam(userId,teamId);
        return {"success":true};
    }    

    @Post('/:teamId/ban')
    async banTeamMember(@Param('teamId') teamId: number, @Body() teamBanDto:TeamMemberSelectDto, @Req() req){
        const userId = req.userId;
        const banUserId = teamBanDto.userId;

        if(userId === banUserId){
            throw new BadRequestException("본인을 추방할 수는 없습니다.");
        }
        
        await this.joinGroupService.banTeamMember(teamId, userId, banUserId);

        return {"success":true};
    }

    @Patch('/:teamId/change')
    async changeTeamMemberRole(@Param('teamId') teamId: number, @Body() changeRoleDto:ChangeRoleDto, @Req() req){
        const userId = req.userId;
        const {selectedUserId, roleType} = changeRoleDto;


        // 본인의 역학을 변경하는 경우
        if(userId === selectedUserId){
            await this.joinGroupService.changeMyRoleToParticipant(teamId,userId,roleType);
        }

        // 다른 팀원의 역할을 변경하는 경우
        else{
            await this.joinGroupService.changeMemberRoleInTeam(teamId,userId,selectedUserId,roleType);
        }

        return {"success":true};
    }

}
