import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Team } from "./team.entity";

@Injectable()
export class TeamRepository extends Repository<Team>{
    constructor(private dataSource: DataSource){
        super(Team, dataSource.createEntityManager());
    }

}