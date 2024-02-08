import { BaseEntity, Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { CodeType } from "./codetype";
import { Group } from "../group/group.entity";


@Entity()
@Unique(['name'])
export class Code extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({type: 'enum', enum: CodeType, nullable: false})
    type: CodeType;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => Group, (group) => group.codes)
    group: Group;
}