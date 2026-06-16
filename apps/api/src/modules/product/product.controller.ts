import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import { Auth } from 'better-auth/types';
import { CreateNewProductApiResponses } from 'src/modules/product/decorators/api-responses.decorators';
import { CreateNewProductRequestDto } from 'src/modules/product/dto/request/create-product.request';
import { ProductService } from 'src/modules/product/product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('/')
  @ApiOperation({
    description: 'Get all products',
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
}
