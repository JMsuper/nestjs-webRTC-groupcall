import { Injectable } from '@nestjs/common';
import { CodeRepository } from './code.repository';
import { Code } from './code.entity';
import { Group } from 'src/group/group.entity';
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
    async createManagerCode(group: Group){
        return this.createCode(group, CodeType.MANAGER);
    }

    // 참가자 코드 생성
    createParticipantCode(group: Group){
        return this.createCode(group, CodeType.PARTICIPANT);
    }

    async createCode(group: Group, codetype: CodeType){
        const codeString: string = await this.createUniqueStringCode();
        
        const code: Code = this.codeRepository.create()
        code.group = group;
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

    // 코드와 연결된 그룹ID 반환
    async getGroupByCode(codeString: string): Promise<number>{
        const code: Code = await this.codeRepository.findOne({where:{name: codeString}, relations: ['group']})
        return code.group.id;
    }

}
