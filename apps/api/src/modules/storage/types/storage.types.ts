import { UploadType } from '../dto/request.dto';

export type UploadTokenJWTPayload = {
  maxFileSize: number;
  allowedMimeTypes: string[];
  variantId?: string;
  productId: string;
  uploadType: UploadType;
};

export type TusMetadata = Record<string, string> & {
  filename?: string;
  filetype?: string;
  name?: string;
  relativePath?: string;
};
