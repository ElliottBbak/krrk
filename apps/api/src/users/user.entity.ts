import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType, SocialProvider } from '@krrk/shared';
import { GroupMember } from '../groups/group-member.entity';

export const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#34d399', '#22d3ee', '#60a5fa', '#a78bfa',
  '#f472b6', '#e879f9',
];

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30 })
  nickname: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.GUEST })
  type: UserType;

  @Column({ unique: true, nullable: true })
  personalToken: string;

  @Column({ type: 'enum', enum: SocialProvider, nullable: true })
  socialProvider: SocialProvider;

  @Column({ nullable: true })
  socialId: string;

  @Column({ default: '#60a5fa' })
  avatarColor: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GroupMember, (member) => member.user)
  groupMembers: GroupMember[];
}
