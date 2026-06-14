import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@krrk/shared';
import { User, AVATAR_COLORS } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { InviteLinksService } from '../invite-links/invite-links.service';
import { GuestAuthDto } from './dto/guest-auth.dto';
import { TokenAuthDto } from './dto/token-auth.dto';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly inviteLinksService: InviteLinksService,
  ) {}

  async guestAuth(dto: GuestAuthDto) {
    const personalToken = crypto.randomBytes(32).toString('hex');
    const avatarColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = this.userRepo.create({
      nickname: dto.nickname,
      type: UserType.GUEST,
      personalToken,
      avatarColor,
      lastSeenAt: new Date(),
    });
    await this.userRepo.save(user);

    if (dto.inviteToken) {
      await this.inviteLinksService.joinViaSharedLink(dto.inviteToken, user);
    }

    const accessToken = this.signToken(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const personalLink = `${frontendUrl}/me/${personalToken}`;

    return { userId: user.id, accessToken, personalToken, personalLink };
  }

  async tokenAuth(dto: TokenAuthDto) {
    const user = await this.usersService.findByPersonalToken(dto.personalToken);
    if (!user) throw new UnauthorizedException('유효하지 않은 토큰입니다.');

    await this.usersService.updateLastSeen(user.id);

    const memberships = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groupMembers', 'gm')
      .leftJoinAndSelect('gm.group', 'group')
      .where('user.id = :id', { id: user.id })
      .getOne();

    const groups =
      memberships?.groupMembers?.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        status: m.group.status,
      })) ?? [];

    const accessToken = this.signToken(user);

    return { userId: user.id, accessToken, nickname: user.nickname, groups };
  }

  private signToken(user: User): string {
    const expiresIn =
      user.type === UserType.GUEST
        ? this.configService.get<string>('JWT_EXPIRES_IN_GUEST', '30d')
        : this.configService.get<string>('JWT_EXPIRES_IN_TOKEN', '365d');

    return this.jwtService.sign(
      { sub: user.id, type: user.type },
      { expiresIn: expiresIn as any },
    );
  }
}
