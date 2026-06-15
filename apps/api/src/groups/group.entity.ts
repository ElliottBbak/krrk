import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupStatus } from '@krrk/shared';
import { GroupMember } from './group-member.entity';
import { InviteLink } from '../invite-links/invite-link.entity';
import { Challenge } from '../challenges/challenge.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.ACTIVE })
  status: GroupStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastGameAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dormantAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => InviteLink, (invite) => invite.group)
  inviteLinks: InviteLink[];

  @OneToMany(() => Challenge, (challenge) => challenge.group)
  challenges: Challenge[];
}
