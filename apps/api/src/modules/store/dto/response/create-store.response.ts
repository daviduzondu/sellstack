import { ApiProperty } from '@nestjs/swagger';
import { CreateStoreDto } from 'src/modules/store/dto/request/create-store.request';

export class CreateStoreResponseDto extends CreateStoreDto {
  @ApiProperty({ example: 'owner-uuid' })
  ownerId: string;
}
