import { Body, Controller, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { Auth } from 'better-auth';
import { CreateStoreApiResponses } from 'src/modules/store/decorators/api-responses.decorators';
import { CreateStoreDto } from 'src/modules/store/dto/request/create-store.request';
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
    console.log(session);
    return await this.storeService.createNewStore(
      session.user.id,
      payload.name,
    );
  }
}
