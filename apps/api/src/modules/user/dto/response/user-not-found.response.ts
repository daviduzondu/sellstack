import { ApiProperty } from '@nestjs/swagger';

export class UserNotFoundResponseDto {
  @ApiProperty({ type: 'string', example: 'User not found' })
  message: string;
}
