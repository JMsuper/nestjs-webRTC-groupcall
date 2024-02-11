import { OmitType, PickType } from "@nestjs/mapped-types";
import { Team } from "./team.entity";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CodeType } from "src/code/codetype";

export class TeamBaseDto{
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsNumber()
    @IsNotEmpty()
    createUserId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    static of(team: Team){
        const teamBaseDto = new TeamBaseDto();
        teamBaseDto.id = team.id;
        teamBaseDto.createUserId = team.createUserId;
        teamBaseDto.name = team.name;
        return teamBaseDto
    }
}

export class CreateTeamDto extends OmitType(TeamBaseDto,['id','createUserId']){}

export class UpdateTeamDto extends OmitType(TeamBaseDto,['createUserId']){}

export class TeamBaseDtoWithCode extends TeamBaseDto{
    managerCode: string;

    participantCode: string;
}

export class TeamJoinDto{
    @IsNotEmpty()
    code: string
}

export class TeamExitDto{
    @IsNotEmpty()
    @IsNumber()
    teamId: number
}

export class TeamMemberSelectDto{
    @IsNotEmpty()
    @IsNumber()
    userId: number
}

export class ChangeRoleDto{
    @IsNotEmpty()
    @IsNumber()
    selectedUserId: number

    @IsEnum(CodeType)
    roleType: CodeType
}