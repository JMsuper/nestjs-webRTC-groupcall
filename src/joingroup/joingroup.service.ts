import { BadRequestException, Injectable } from '@nestjs/common';
import { JoingroupRepository } from './joingroup.repository';
import { CodeService } from 'src/code/code.service';
import { Team } from 'src/team/team.entity';
import { CodeType } from 'src/code/codetype';
import { JoinGroup } from './joingroup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

    // 그룹 내 참여중인 회원 목록 조회

    // 그룹 내 참여중인 회원 추방(관리자 권한)

    // 그룹 내 참여중인 회원 역할 변경(관리자 or 참여자)(소유자 권한)
}
