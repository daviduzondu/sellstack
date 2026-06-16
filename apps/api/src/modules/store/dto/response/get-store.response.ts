import { ApiProperty } from '@nestjs/swagger';

export class GetStoreResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  ownerId: string;

  @ApiProperty({ type: 'string', example: "David's Digital Den" })
  description: string | null;

  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string', example: 'My Store' })
  name: string;

  @ApiProperty({ type: 'string', example: 'my-store' })
  slug: string;
}
