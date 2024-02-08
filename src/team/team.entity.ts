import { JoinGroup } from "../joingroup/joingroup.entity";
import { Code } from "../code/code.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Team extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    createUserId: number;

    @Column({nullable: false})
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Code, (code) => code.team)
    codes: Code[]

    @OneToMany(() => JoinGroup, joinGroup => joinGroup.team)
    joinUsers: JoinGroup[]
}