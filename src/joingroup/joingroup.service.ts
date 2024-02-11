import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JoingroupRepository } from './joingroup.repository';
import { CodeService } from 'src/code/code.service';
import { Team } from '../team/team.entity';
import { CodeType } from '../code/codetype';
import { JoinGroup } from './joingroup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetJoinGroupDto } from './joingroup.dto';

@Injectable()
export class JoingroupService {

    constructor(
        private joinGroupRepository :JoingroupRepository,
        @InjectRepository(Team) private teamRepository: Repository<Team>,
        private codeService: CodeService
    ){}

    // 코드로 그룹 참여
    async joinTeamWithCode(code: string, userId: number): Promise<any>{
        const team: Team = await this.codeService.getTeamByCode(code);

        if(await this.joinGroupRepository.findOneBy({teamId: team.id, userId: userId})){
            throw new BadRequestException("이미 참여한 팀입니다.")
        }

        const codeType: CodeType = await this.codeService.getTypeOfCode(code);

        const isOwner = codeType === CodeType.MANAGER ? true : false

        await this.joinGroupRepository.save({
            userId,
            teamId : team.id,
            isOwner
        });

        return {teamId : team.id, isOwner : isOwner}
    }

    // 그룹 나가기
    async exitTeam(teamId: number, userId: number){
        const joinGroup: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId});

        if(!joinGroup){
            throw new BadRequestException("참여하지 않은 팀입니다.");
        }

        const number = await this.joinGroupRepository.countBy({teamId});

        // 얘가 나가고 그룹 인원이 0명이면 그룹 삭제(이 경우 owner 인원 상관 없음)
        if(number === 1){
            this.joinGroupRepository.softRemove(joinGroup);
            this.teamRepository.softDelete({id:teamId});
            
        }else{
            const ownerCount = await this.joinGroupRepository.countBy({teamId,isOwner:true});

            // 얘가 나갔는데 그룹에 owner가 없으면 그룹 나가기 불가
            if(ownerCount === 1){
                throw new BadRequestException("관리자를 지정한 이후, 팀을 나갈 수 있습니다.");
            }
            this.joinGroupRepository.softRemove(joinGroup);
        }
    }

    // 참여중인 그룹 목록 조회
    async getJoinedGroupList(userId: number){
        const queryResult: GetJoinGroupDto[] = await this.joinGroupRepository.findJoinedGroupWithParticipantCnt(userId);
        return queryResult;

    }

    // 그룹 내 참여중인 회원 추방(관리자 권한)
    async banTeamMember(teamId: number, userId: number, banUserId: number){
        // 요청자가 관리자여야함
        const joinGroup: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId});

        if(! joinGroup){
            throw new UnauthorizedException("참여중이지 않은 팀입니다.")
        }

        if(! joinGroup.isOwner){
            throw new UnauthorizedException("회원 추방은 관리자만 가능합니다.")
        }

        // 요청자는 참여자만 추방할 수 있음
        const banUser: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId: banUserId});
        
        if(! banUser){
            throw new UnauthorizedException(`참여중이지 않은 팀원 입니다. id = ${banUserId}`);
        }

        if(banUser.isOwner){
            throw new UnauthorizedException("관리자는 추방당할 수 없습니다.");
        }

        this.joinGroupRepository.softRemove(banUser);
    }

    // 본인 역할 변경
    async changeMyRoleToParticipant(teamId: number, userId: number, roleType: CodeType){
        
        const joinGroup: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId});

        if(! joinGroup){
            throw new UnauthorizedException("참여중이지 않은 팀입니다.")
        }

        if(! joinGroup.isOwner){
            throw new UnauthorizedException("역할 변경은 관리자만 가능합니다.")
        }

        if( roleType === CodeType.MANAGER){
            throw new BadRequestException("동일한 역할로 변경을 시도하였습니다.")
        }

        const ownerCnt: number = await this.joinGroupRepository.countBy({teamId, isOwner: true});

        if(ownerCnt <= 1){
            throw new BadRequestException("관리자가 1명 이하인 경우, 참여자로 역할을 변경할 수 없습니다.");
        }

        joinGroup.isOwner = false;
        this.joinGroupRepository.save(joinGroup);
    }

    // 그룹 내 참여중인 회원 역할 변경(소유자 권한)
    async changeMemberRoleInTeam(teamId: number, userId: number, selectedUserId: number, roleType: CodeType){
        
        const joinGroup: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId});

        if(! joinGroup){
            throw new UnauthorizedException("참여중이지 않은 팀입니다.")
        }

        if(! joinGroup.isOwner){
            throw new UnauthorizedException("다른 회원의 역할 변경은 관리자만 가능합니다.")
        }

        const selectedUser: JoinGroup = await this.joinGroupRepository.findOneBy({teamId, userId: selectedUserId});
        
        if(! selectedUser){
            throw new UnauthorizedException(`참여중이지 않은 팀원 입니다. id = ${selectedUserId}`);
        }

        selectedUser.isOwner = roleType === CodeType.MANAGER ? true : false;

        this.joinGroupRepository.save(selectedUser);
    }

}
