import { Module } from '@nestjs/common';
import { RoutersController } from './routers.controller';
import { RoutersService } from './routers.service';
import { RadiusModule } from '../radius/radius.module';
import { MikrotikModule } from '../mikrotik/mikrotik.module';

@Module({
  imports: [RadiusModule, MikrotikModule],
  controllers: [RoutersController],
  providers: [RoutersService],
  exports: [RoutersService],
})
export class RoutersModule {}
