import { Body, Controller, Get, Post } from '@nestjs/common';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { Auth } from 'better-auth/types';
import { CreateNewProductApiResponses } from 'src/modules/product/decorators/swagger.decorators';
import { CreateNewProductRequestDto } from 'src/modules/product/dto/request.dto';
import { ProductService } from 'src/modules/product/product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get('/')
  @OptionalAuth()
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
