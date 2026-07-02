import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { BetterAuthSession } from 'src/common/types/types.common';
import { CartService } from 'src/modules/cart/cart.service';
import {
  AddToCartApiResponses,
  GetActiveCartApiResponses,
  RemoveCartItemApiResponses,
} from 'src/modules/cart/decorators/api-docs.decorator';
import { AddToCartRequestDto } from 'src/modules/cart/dto/request.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('/active')
  @GetActiveCartApiResponses()
  async getActiveCart(@Session() session: BetterAuthSession) {
    return await this.cartService.getActiveCart(session.user.id);
  }

  @Post('/items')
  @AddToCartApiResponses()
  async addItemToCart(
    @Session() session: BetterAuthSession,
    @Body() payload: AddToCartRequestDto,
  ) {
    return await this.cartService.addProductToCart({
      variantId: payload.variantId,
      userId: session.user.id,
      quantity: payload.quantity ?? 1,
    });
  }

  @Delete('/items/:itemId')
  @RemoveCartItemApiResponses()
  async removeItemFromCart(
    @Session() session: BetterAuthSession,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return await this.cartService.removeItemFromCart({
      cartItemId: itemId,
      userId: session.user.id,
    });
  }
}
