import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { TeamRepository } from './team.repository';
import { Team } from './team.entity';
import { CreateTeamDto, TeamBaseDto, TeamBaseDtoWithCode, UpdateTeamDto } from './team.dto';
import { CodeService } from '../code/code.service';
import { CodeBaseDto } from '../code/code.dto';
import { JoingroupRepository } from '../joingroup/joingroup.repository';
import { JoinGroup } from '../joingroup/joingroup.entity';
import { CodeType } from '../code/codetype';

@Injectable()
export class TeamService {
    constructor(
        private codeService: CodeService,
        private teamRepository: TeamRepository,
        private joinGroupRepository: JoingroupRepository
    ){}

    // C: 그룹 생성
    async createTeam(createTeamDto: CreateTeamDto, userId: number){
        const team = this.teamRepository.create(createTeamDto);
        team.createUserId = userId;

        await this.teamRepository.save(team);

        const managerCode: CodeBaseDto = await this.codeService.createManagerCode(team);
        const participantCode: CodeBaseDto = await this.codeService.createParticipantCode(team);

        const result: TeamBaseDtoWithCode = {
            id: team.id,
            createUserId: team.createUserId,
            name: team.name,
            managerCode: managerCode.name,
            participantCode: participantCode.name
        }

        await this.joinGroupRepository.save({userId: userId, teamId: team.id, isOwner: true})

        return result;
    }

    // R: 그룹 정보와 참여자 정보 조회
    async getTeamWithUser(userId: number, teamId: number){

        const reqeustedUser = await this.joinGroupRepository.findOneBy({userId,teamId});

        if(! reqeustedUser){
            throw new BadRequestException("미참여 팀 정보는 조회할 수 없습니다.")
        }

        var team;

        if(reqeustedUser.isOwner){
            const teamResult: Team = await this.teamRepository.findOne({where:{id: teamId}, relations:{codes: true}});
            if(! teamResult || teamResult.codes.length === 0){
                throw new BadRequestException("존재하지 않는 팀입니다.")
            }
            team = {
                id : teamResult.id,
                name : teamResult.name,
                managerCode : teamResult.codes.filter((code)=> code.type == CodeType.MANAGER)[0].name,
                participantCode : teamResult.codes.filter((code)=> code.type == CodeType.PARTICIPANT)[0].name
            }
    
        }else{
            const teamResult: Team = await this.teamRepository.findOneBy({id: teamId});
            if(! teamResult){
                throw new BadRequestException("존재하지 않는 팀입니다.")
            }
            team = {
                id : teamResult.id,
                name : teamResult.name,
            }
        }

        const joinGroups: JoinGroup[] = await this.joinGroupRepository.findByTeamIdJoinUser(teamId);
        
        const users = [];
        for(let joinGroup of joinGroups){
            const {id,name, email} = joinGroup.user;
            const isOwner = joinGroup.isOwner;
            users.push({
                id,name,email,isOwner
            })
        }
        return {team, users};
    }

    // U:  그룹 정보 수정(관리자 권한)
    async updateTeam(updateTeamDto:UpdateTeamDto, userId: number){
        const {id, name} = updateTeamDto;

        const team = await this.teamRepository.findOneBy({id});
        if(!team){
            throw new BadRequestException("존재하지 않는 팀입니다.")
        }

        const joinGroup = await this.joinGroupRepository.findOneBy({userId, teamId: id});

        if(!joinGroup || !joinGroup.isOwner){
            throw new UnauthorizedException("관리자 이외에 팀 정보를 수정할 수 없습니다.")
        }

        team.name = name;
        return TeamBaseDto.of(await this.teamRepository.save(team));
        
    }

    // D: 그룹 삭제(소유자 권한)
    async deleteTeam(userId, teamId){

        const team = await this.teamRepository.findOneBy({id:teamId});
        if(!team){
            throw new BadRequestException("존재하지 않는 팀입니다.")
        }

        const joinGroup = await this.joinGroupRepository.findOneBy({userId, teamId});

        if(!joinGroup || !joinGroup.isOwner){
            throw new UnauthorizedException("관리자 이외에 팀을 삭제할 수 없습니다.")
        }

        this.teamRepository.softRemove(team);
    }

}
