import { Module } from '@nestjs/common';
import { InternetAccountsController } from './internet-accounts.controller';
import { InternetAccountsService } from './internet-accounts.service';
import { RadiusModule } from '../radius/radius.module';

@Module({
  imports: [RadiusModule],
  controllers: [InternetAccountsController],
  providers: [InternetAccountsService],
  exports: [InternetAccountsService],
})
export class InternetAccountsModule {}
