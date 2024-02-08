import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './code.entity';
import { CodeRepository } from './code.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [CodeService,CodeRepository],
  exports:[CodeService]
})
export class CodeModule {}
