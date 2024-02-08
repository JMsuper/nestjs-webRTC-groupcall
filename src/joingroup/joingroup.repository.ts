import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { JoinGroup } from "./joingroup.entity";

@Injectable()
export class JoingroupRepository extends Repository<JoinGroup>{
    constructor(private dataSource: DataSource){
        super(JoinGroup, dataSource.createEntityManager());
    }

    findByTeamIdJoinUser(teamId: number){
        return this.find({where: {teamId}, relations: ['user']})
    }

}