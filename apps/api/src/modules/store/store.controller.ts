import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import type { Auth } from 'better-auth';
import type { BetterAuthSession } from 'src/common/types/types.common';
import {
  CreateStoreApiResponses,
  ListStoreProductsApiResponses,
} from 'src/modules/store/decorators/swagger.decorators';
import {
  CreateStoreDto,
  ListStoreProductsRequestDto,
} from 'src/modules/store/dto/request.dto';
import { StoreService } from 'src/modules/store/store.service';

@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Post('/')
  @CreateStoreApiResponses()
  async createStore(
    @Session() session: Auth['$Infer']['Session'],
    @Body() payload: CreateStoreDto,
  ) {
    return await this.storeService.createNewStore(
      session.user.id,
      payload.name,
    );
  }

  @Get('/:id')
  @OptionalAuth()
  @ListStoreProductsApiResponses()
  async getProductsInStore(
    @Param() { id }: ListStoreProductsRequestDto,
    @Session() session?: BetterAuthSession,
  ) {
    return await this.storeService.getStoreProducts(id, !!session?.user);
  }
}
