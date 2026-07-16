import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ type: 'string', example: 'Books by Sommy' })
  @IsString()
  name: string;
}

export class ListStoreProductsRequestDto {
  @IsString()
  id: string;
}

export class AddSettlementAccountRequestDto {
  @ApiProperty({ type: 'number', example: 1234567890 })
  @IsNumber()
  accountNumber: number;

  @ApiProperty({ type: 'string', example: '044' })
  @IsString()
  bankCode: string;
}
