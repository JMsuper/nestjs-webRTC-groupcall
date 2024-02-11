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

    findJoinedGroupWithParticipantCnt(userId: number){
        return this.createQueryBuilder('join_group')
                .select(['join_group.teamId as teamId', 'team.name as teamName', 'COUNT(join_group.userId) as userCount'])
                .innerJoin((qb) => 
                    qb.
                        from("join_group", "sub_query")
                        .where('sub_query.userId = :userId', {userId: userId}),
                    'join_cnt',
                    'join_group.teamId = join_cnt.teamId'
                )
                .innerJoin('team','team','join_group.teamId = team.id')
                .groupBy('join_group.teamId')
                .getRawMany()
    }

}