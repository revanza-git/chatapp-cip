import { Module } from '@nestjs/common';
import { ProfileController } from '../routes/profile.controller';

@Module({
  controllers: [ProfileController]
})
export class ProfileModule {}
