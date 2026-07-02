import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductModule } from 'src/modules/product/product.module';
import { StoreModule } from 'src/modules/store/store.module';

@Module({
  imports: [ProductModule, StoreModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
