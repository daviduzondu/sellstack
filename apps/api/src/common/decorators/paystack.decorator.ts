import { Inject } from '@nestjs/common';
import { PAYSTACK_CONFIG } from 'src/common/constants/token.constants';

export const InjectPaystack = () => Inject(PAYSTACK_CONFIG);
