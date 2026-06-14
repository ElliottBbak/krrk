import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from '../../groups/group-member.entity';

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.user;
    const groupId = request.params.groupId;

    if (!groupId) return true;

    const member = await this.groupMemberRepo.findOne({
      where: { groupId, userId },
    });

    if (!member) throw new ForbiddenException('그룹 멤버가 아닙니다.');
    return true;
  }
}
