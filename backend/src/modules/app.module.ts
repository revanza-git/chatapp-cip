import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { HealthController } from '../routes/health.controller';
import { AuthModule } from './auth.module';
import { ProfileModule } from './profile.module';
import { UsersModule } from './users.module';
import { DocumentsModule } from './documents.module';
import { ChatModule } from './chat.module';
import { UploadsModule } from './uploads.module';
import { AuditModule } from './audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    ChatModule,
    UploadsModule,
    AuditModule,
    ProfileModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
