import { Code } from "../code/code.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Group extends BaseEntity{
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

    @OneToMany(() => Code, (code) => code.group)
    @JoinColumn({name: 'codeId'})
    codes: Code[]
}