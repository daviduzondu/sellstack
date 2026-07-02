import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { Type } from '@sinclair/typebox';
import { Auth } from 'better-auth/types';
import {
  CreateNewProductApiResponses,
  EditProductApiResponses,
} from 'src/modules/product/decorators/api-docs.decorator';
import {
  CreateNewProductRequestDto,
  EditProductRequestDto,
} from 'src/modules/product/dto/request.dto';
import { ProductService } from 'src/modules/product/product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('/')
  @OptionalAuth()
  @ApiOperation({ description: 'List all products' })
  @ApiOkResponse({
    schema: Type.Object({ products: Type.Array(Type.String()) }),
  })
  getProducts() {
    return {
      products: ['Milk'],
    };
  }

  @Post('/')
  @CreateNewProductApiResponses()
  async createNewProduct(
    @Session() session: Auth['$Infer']['Session'],
    @Body() payload: CreateNewProductRequestDto,
  ) {
    return await this.productService.createNewProduct(payload, session.user.id);
  }

  @Post('/:id')
  @EditProductApiResponses()
  async editProduct(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() payload: EditProductRequestDto,
  ) {
    return await this.productService.editProductInfo(payload, productId);
  }
}
