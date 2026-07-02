import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartRequestDto {
  @ApiProperty({ type: 'string', example: 'uuid-of-variant' })
  @IsString()
  variantId: string;

  @ApiPropertyOptional({ type: 'number', example: 1 })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  quantity?: number;
}
