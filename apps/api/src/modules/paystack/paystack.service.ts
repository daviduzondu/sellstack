import { Inject, Injectable } from '@nestjs/common';
import type { paths } from 'src/lib/paystack';
import { type Client } from 'openapi-fetch';
import { PAYSTACK_CLIENT } from 'src/common/constants/token.constants';

@Injectable()
export class PaystackService {
  constructor(
    @Inject(PAYSTACK_CLIENT) private readonly client: Client<paths>,
  ) {}

  get api() {
    return this.client;
  }
}
