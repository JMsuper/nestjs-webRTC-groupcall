import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { Code } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [CodeService]
})
export class CodeModule {}
