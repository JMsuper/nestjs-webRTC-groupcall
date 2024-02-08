import { OmitType, PickType } from "@nestjs/mapped-types";
import { Team } from "./team.entity";
import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

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