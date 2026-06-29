import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { ProductModule } from 'src/modules/product/product.module';
import { StoreModule } from 'src/modules/store/store.module';

@Module({
  imports: [ProductModule, StoreModule],
  providers: [CartService],
})
export class CartModule {}
