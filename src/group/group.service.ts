import { Injectable } from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { Group } from './group.entity';

@Injectable()
export class GroupService {
    constructor(
        private groupRepository: GroupRepository
    ){}

}
