import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');
    return user;
  }

  async findByPersonalToken(personalToken: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { personalToken } });
  }

  async updateLastSeen(id: string): Promise<void> {
    await this.userRepo.update(id, { lastSeenAt: new Date() });
  }
}
