import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamRepository } from './team.repository';
import { CodeModule } from '../code/code.module';
import { JoingroupModule } from '../joingroup/joingroup.module';
import { TeamController } from './team.controller';

@Module({
  imports: [JoingroupModule,CodeModule,TypeOrmModule.forFeature([Team])],
  providers: [TeamService,TeamRepository],
  controllers: [TeamController]
})
export class TeamModule {}
