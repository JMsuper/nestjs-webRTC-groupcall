import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, TeamJoinDto, UpdateTeamDto } from './team.dto';
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

}
