import { Code } from "./code.entity";
import { CodeType } from "./codetype";

export class CodeBaseDto{

    name: string;

    type: CodeType;

    static of(code: Code){
        const codeBaseDto: CodeBaseDto = new CodeBaseDto();
        codeBaseDto.name = code.name;
        codeBaseDto.type = code.type;
        return codeBaseDto
    }
}