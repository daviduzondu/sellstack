import { Inject } from '@nestjs/common';
import { KYSELY_INSTANCE } from 'src/common/constants/token.constants';

export const Db = () => Inject(KYSELY_INSTANCE);
