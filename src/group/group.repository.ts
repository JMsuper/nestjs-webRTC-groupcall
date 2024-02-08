import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Group } from "./group.entity";

@Injectable()
export class GroupRepository extends Repository<Group>{
    constructor(private dataSource: DataSource){
        super(Group, dataSource.createEntityManager());
    }

}