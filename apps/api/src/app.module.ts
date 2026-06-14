import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { InviteLinksModule } from './invite-links/invite-links.module';
import { User } from './users/user.entity';
import { Group } from './groups/group.entity';
import { GroupMember } from './groups/group-member.entity';
import { InviteLink } from './invite-links/invite-link.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'krrk'),
        password: config.get<string>('DATABASE_PASSWORD', 'krrk'),
        database: config.get<string>('DATABASE_NAME', 'krrk'),
        entities: [User, Group, GroupMember, InviteLink],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    GroupsModule,
    InviteLinksModule,
  ],
})
export class AppModule {}
