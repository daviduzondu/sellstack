import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum UploadType {
  PRODUCT = 'product',
  PROFILE = 'profile',
}

type ProductUploadMetadata = {
  uploadType: UploadType.PRODUCT;
  variantId: string;
  fileName: string;
};

type ProfileUploadMetadata = {
  uploadType: UploadType.PROFILE;
  fileName: string;
};

export type UploadMetadata = ProductUploadMetadata | ProfileUploadMetadata;

export class GenerateUploadKeyRequestDto {
  @ApiProperty({ enum: UploadType, example: UploadType.PRODUCT })
  @IsEnum(UploadType)
  uploadType: UploadType;

  @ApiProperty({ type: 'string', example: 'cover-photo.png' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ type: 'string', example: 'uuid-of-variant' })
  @ValidateIf(
    (o: GenerateUploadKeyRequestDto) => o.uploadType === UploadType.PRODUCT,
  )
  @IsString()
  @IsNotEmpty()
  variantId: string | undefined;
}
