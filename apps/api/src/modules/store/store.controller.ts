import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import type { Auth } from 'better-auth';
import type { BetterAuthSession } from 'src/common/types/types.common';
import {
  AddSettlementAccountApiResponses,
  CreateStoreApiResponses,
  ListStoreProductsApiResponses,
} from 'src/modules/store/decorators/api-docs.decorator';
import { Store } from 'src/modules/store/decorators/store/store.decorator';
import {
  AddSettlementAccountRequestDto,
  CreateStoreDto,
  ListStoreProductsRequestDto,
} from 'src/modules/store/dto/request.dto';
import { ValidStoreGuard } from 'src/modules/store/guards/valid-store.guard';
import { StoreService } from 'src/modules/store/store.service';
import { TStore} from 'src/modules/store/store.types';

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

  @Post('bank')
  @UseGuards(ValidStoreGuard)
  @AddSettlementAccountApiResponses()
  async addSettlementAccount(@Body() payload: AddSettlementAccountRequestDto, @Store() store: NonNullable<TStore>) {
    return await this.storeService.addSettlementAccount({accountNumber: Number(payload.accountNumber), bankCode: payload.bankCode, storeId: store.id})
  }
}
