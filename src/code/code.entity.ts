import { BaseEntity, Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { CodeType } from "./codetype";
import { Team } from "../team/team.entity";


@Entity()
@Unique(['name'])
export class Code extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    teamId: number;

    @Column({nullable: false})
    name: string;

    @Column({type: 'enum', enum: CodeType, nullable: false})
    type: CodeType;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => Team, (team) => team.codes)
    @JoinColumn({name: 'teamId', referencedColumnName: 'id'})
    team: Team;
}