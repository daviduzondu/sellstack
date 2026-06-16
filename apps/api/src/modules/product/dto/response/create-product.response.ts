import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateNewProductRequestDto } from 'src/modules/product/dto/request/create-product.request';

export class CreateNewProductResponseDto extends PickType(
  CreateNewProductRequestDto,
  ['name'] as const,
) {
  @ApiProperty({ example: 'some-product-uuid', type: 'string' })
  productId: string;

  @ApiProperty({ example: 'some-variant-uuid', type: 'string' })
  variantId: string;
}
