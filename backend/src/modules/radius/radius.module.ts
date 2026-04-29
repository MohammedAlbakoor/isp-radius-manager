import { Module } from '@nestjs/common';
import { RadiusSyncService } from './radius-sync.service';
import { RadiusController } from './radius.controller';

@Module({
  controllers: [RadiusController],
  providers: [RadiusSyncService],
  exports: [RadiusSyncService],
})
export class RadiusModule {}
