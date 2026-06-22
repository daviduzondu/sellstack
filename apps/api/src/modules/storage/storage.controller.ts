import {
  All,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StorageService } from 'src/modules/storage/storage.service';
import type { Request, Response } from 'express';
import { OptionalAuth, Session } from '@thallesp/nestjs-better-auth';
import { GenerateUploadKeyRequestDto } from 'src/modules/storage/dto/request.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  GenerateUploadTokenApiResponses,
  HandleTusUploadApiDocs,
} from 'src/modules/storage/decorators/api-docs.decorator';
import type { BetterAuthSession } from 'src/common/types/types.common';
import { UploadTokenGuard } from 'src/common/guards/upload-token.guard';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('/uploads/token')
  @GenerateUploadTokenApiResponses()
  async generateUploadToken(
    @Body() payload: GenerateUploadKeyRequestDto,
    @Session() session: BetterAuthSession,
  ) {
    return await this.storageService.generateUploadToken(
      payload,
      session.user.id,
    );
  }

  @Post('/uploads{/*path}')
  @HandleTusUploadApiDocs()
  @OptionalAuth()
  @UseGuards(UploadTokenGuard)
  async handleTusUpload(@Req() req: Request, @Res() res: Response) {
    return await this.storageService.tus.handle(req, res);
  }

  @All('/uploads{/*path}')
  @ApiExcludeEndpoint()
  @OptionalAuth()
  @UseGuards(UploadTokenGuard)
  async handleTusUploadCollection(@Req() req: Request, @Res() res: Response) {
    return await this.storageService.tus.handle(req, res);
  }
}
