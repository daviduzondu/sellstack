import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ type: 'string', example: 'Books by Sommy' })
  @IsString()
  name: string;
}

export class ListStoreProductsRequestDto {
  @IsString()
  id: string;
}
