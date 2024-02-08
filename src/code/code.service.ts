import { BadRequestException, Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import { Code } from './code.entity';
import { Team } from 'src/team/team.entity';
import { CodeType } from './codetype';
import { CodeBaseDto } from './code.dto';

@Injectable()
export class CodeService {

    codeLength: number;

    constructor(
        private codeRepository: CodeRepository
    ){
        this.codeLength = 8;
    }

    // 관리자 코드 생성
    async createManagerCode(team: Team){
        return this.createCode(team, CodeType.MANAGER);
    }

    // 참가자 코드 생성
    createParticipantCode(team: Team){
        return this.createCode(team, CodeType.PARTICIPANT);
    }

    async createCode(team: Team, codetype: CodeType){
        const codeString: string = await this.createUniqueStringCode();
        
        const code: Code = this.codeRepository.create()
        code.team = team;
        code.name = codeString;
        code.type = codetype;

        const createCode: Code = await this.codeRepository.save(code);
        return CodeBaseDto.of(createCode);
    }

    // 유니크한 코드 생성
    async createUniqueStringCode(){
        var isDuplicated: boolean = true
        var code: string;

        while(isDuplicated){
            code = this.generateAlphaNumericCode();
            isDuplicated = await this.isCodeDuplicated(code);
        }

        return code;
    }

    // 알파벳 + 숫자, 코드 생성
    generateAlphaNumericCode(){
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < this.codeLength) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    // 코드 중복 체크
    async isCodeDuplicated(code: string){
        const result = await this.codeRepository.findOneBy({name: code});
        if(! result){
            return false;
        }
        return true;
    }

    // 코드와 연결된 팀 반환
    async getTeamByCode(codeString: string): Promise<Team>{
        const code: Code = await this.codeRepository.findOne({where:{name: codeString}, relations: ['team']})
        if(!code){
            throw new BadRequestException("존재하지 않는 코드입니다.")
        }
        return code.team;
    }

    async getTypeOfCode(codeString: string){
        const code: Code = await this.codeRepository.findOneBy({name: codeString});
        if(!code){
            throw new BadRequestException("존재하지 않는 코드입니다.")
        }
        return code.type;
    }

}
