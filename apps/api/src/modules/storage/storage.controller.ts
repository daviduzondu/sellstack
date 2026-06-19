import { All, Controller, Req, Res } from '@nestjs/common';
import { StorageService } from 'src/modules/storage/storage.service';
import type { Request, Response } from 'express';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @All('/uploads{/*path}')
  @OptionalAuth()
  async handleTusUploadCollection(@Req() req: Request, @Res() res: Response) {
    // return this.handleTusUpload(req, res);
    return await this.storageService.tus.handle(req, res);
  }
}
