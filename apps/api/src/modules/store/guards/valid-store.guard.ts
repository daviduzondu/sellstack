import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Request } from 'express';
import {fromNodeHeaders} from 'better-auth/node';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { STORE_NOT_FOUND, UNAUTHORIZED } from 'src/common/constants/error-messages.constants';
import { StoreService } from 'src/modules/store/store.service';
import { BadRequestError } from 'src/common/errors/bad-request.error';
import { TStore } from 'src/modules/store/store.types';

@Injectable()
export class ValidStoreGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly storeService: StoreService){ }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & {store: TStore}>();
    const result = await this.authService.api.getSession({
      headers: fromNodeHeaders(request.headers)
    });
    if (!result) throw new UnauthorizedError(UNAUTHORIZED);
    const store = await this.storeService.getStoreInfoFromUserId(result.user.id);
    if (!store) throw new BadRequestError(STORE_NOT_FOUND);
    request.store = store;
    return true;
  }
}
