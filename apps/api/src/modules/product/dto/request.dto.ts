import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  Equals,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Insertable } from 'kysely';
import {
  Currency,
  Products,
  Producttype,
} from 'src/modules/db/generated/types';

export class CreateNewProductRequestDto implements Omit<
  Insertable<Products>,
  'userId' | 'storeId'
> {
  @ApiProperty({ type: 'string', example: 'The Ultimate Notion Template' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', example: 'A comprehensive template for...' })
  @IsString()
  @MaxLength(5000)
  longDescription: string;

  @ApiPropertyOptional({
    type: 'string',
    example: "The last Notion template you'll ever need",
  })
  @IsString()
  @IsOptional()
  @MaxLength(160)
  shortDescription: string;

  @ApiProperty({
    enum: Producttype,
    enumName: 'ProductType',
    example: Producttype.EBOOK,
  })
  @IsEnum(Producttype)
  type: Producttype;

  @ApiProperty({ type: 'string', example: Currency.NGN })
  @IsOptional()
  @Equals(Currency.NGN, {
    message: "Only 'NGN' is currently supported as 'Currency'",
  })
  currency: Currency;

  @ApiProperty({ type: 'number', example: '5000' })
  @IsOptional()
  price: number;
}

export class EditProductRequestDto extends OmitType(
  CreateNewProductRequestDto,
  ['type'],
) {}
