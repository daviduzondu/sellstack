import { Module } from '@nestjs/common';
import { DbModule } from 'src/modules/db/db.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { StoreModule } from 'src/modules/store/store.module';

@Module({
  imports: [DbModule, StoreModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
