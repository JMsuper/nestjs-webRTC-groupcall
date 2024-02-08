import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupRepository } from './group.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupService,GroupRepository]
})
export class GroupModule {}
