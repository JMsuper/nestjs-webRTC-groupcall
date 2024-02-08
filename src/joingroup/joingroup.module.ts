import { Module } from '@nestjs/common';
import { JoingroupService } from './joingroup.service';
import { JoinGroup } from './joingroup.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoingroupRepository } from './joingroup.repository';
import { CodeModule } from 'src/code/code.module';
import { Team } from 'src/team/team.entity';

@Module({
  imports: [CodeModule,TypeOrmModule.forFeature([JoinGroup, Team])],
  providers: [JoingroupService, JoingroupRepository],
  exports:[JoingroupService,JoingroupRepository]
})
export class JoingroupModule {}
