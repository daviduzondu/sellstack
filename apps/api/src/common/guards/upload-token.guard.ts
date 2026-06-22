import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { INVALID_UPLOAD_TOKEN } from 'src/common/constants/error-messages.constants';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { UploadTokenJWTPayload } from 'src/modules/storage/types/storage.types';

@Injectable()
export class UploadTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    try {
      request['decodedUploadToken'] =
        this.jwtService.verify<UploadTokenJWTPayload>(
          request.headers['x-upload-token'] as string,
        );
      return true;
    } catch {
      throw new UnauthorizedError(INVALID_UPLOAD_TOKEN);
    }
  }
}
