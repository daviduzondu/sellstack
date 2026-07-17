import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PaystackService } from 'src/modules/paystack/paystack.service';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly paystackService: PaystackService,
  ) {}

  @Get()
  @ApiOperation({ description: 'Health check' })
  @ApiOkResponse({ type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/banks')
  @OptionalAuth()
  getSettlementBanks(@Query("next") next: string | undefined) {
    return this.paystackService.api.GET('/bank', {
      params: {
        query: {
          use_cursor: true,
          perPage: 100,
          next,
          country: 'nigeria',
          currency: 'NGN',
        },
      },
    });
  }
}
