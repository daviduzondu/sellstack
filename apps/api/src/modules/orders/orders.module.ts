import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from 'src/modules/cart/cart.module';
import { UserModule } from 'src/modules/user/user.module';
import { LedgerModule } from 'src/modules/ledger/ledger.module';
import { StoreModule } from 'src/modules/store/store.module';

@Module({
  imports: [CartModule, UserModule, LedgerModule, StoreModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
