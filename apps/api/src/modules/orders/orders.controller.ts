import { Controller, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { BetterAuthSession } from 'src/common/types/types.common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { CheckoutApiResponses } from 'src/modules/orders/decorators/api-docs.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/checkout')
  @CheckoutApiResponses()
  async checkout(@Session() session: BetterAuthSession) {
    return await this.ordersService.checkoutOrder(session.user.id);
  }
}
