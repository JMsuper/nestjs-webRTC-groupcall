import { Team } from "../team/team.entity";
import { User } from "../user/user.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class JoinGroup extends BaseEntity{

    @PrimaryColumn()
    teamId: number;

    @PrimaryColumn()
    userId: number;

    @Column({nullable: false})
    isOwner: boolean;

    @CreateDateColumn()
    joinedAt: Date;

    @DeleteDateColumn()
    exitedAt: Date;

    @ManyToOne(() => Team, (team) => team.joinUsers)
    @JoinColumn({name: 'teamId', referencedColumnName: 'id'})
    team: Team;

    @ManyToOne(() => User, (user) => user.joinTeams)
    @JoinColumn({name: 'userId', referencedColumnName: 'id'})
    user: User;
}