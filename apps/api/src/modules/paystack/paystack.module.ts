import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import createClient from 'openapi-fetch';
import { PAYSTACK_CLIENT } from 'src/common/constants/token.constants';
import { Env } from 'src/common/types/types.common';
import { paths } from 'src/lib/paystack';
import { PaystackService } from 'src/modules/paystack/paystack.service';

@Global()
@Module({
  providers: [
    PaystackService,
    {
      provide: PAYSTACK_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) =>
        createClient<paths>({
          baseUrl: 'https://api.paystack.co/',
          headers: {
            Authorization: `Bearer ${configService.getOrThrow('PAYSTACK_API_KEY')}`,
          },
        }),
    },
  ],
  exports: [PaystackService, PAYSTACK_CLIENT],
})
export class PaystackModule {}
