import { ConflictException, Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db';
import type { Database } from 'src/modules/db/db.types';
import { UserService } from 'src/modules/user/user.service';
import PG from 'pg';
import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CreateStoreResponseDto } from 'src/modules/store/dto/response/create-store.response';
import {
  STORE_ALREADY_EXISTS,
  USER_NOT_FOUND,
} from 'src/common/constants/error-messages.constants';
import { GetStoreResponseDto } from 'src/modules/store/dto/response/get-store.response';

@Injectable()
export class StoreService {
  constructor(
    @Db() private db: Database,
    private userService: UserService,
  ) {}

  async getStoreInfoFromUserId(
    userId: string,
  ): Promise<GetStoreResponseDto | undefined> {
    const store = await this.db
      .selectFrom('stores')
      .where('userId', '=', userId)
      .select(['id', 'name', 'slug', 'description', 'userId as ownerId'])
      .executeTakeFirst();
    return store;
  }

  async createNewStore(
    userId: string,
    name: string,
  ): Promise<CreateStoreResponseDto> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundError(USER_NOT_FOUND);
    const result = await this.db
      .insertInto('stores')
      .values({
        slug: crypto.randomUUID(),
        name,
        userId: user.id,
      })
      .returning(['userId as ownerId', 'name'])
      .executeTakeFirstOrThrow()
      .catch((error) => {
        if (error instanceof PG.DatabaseError) {
          if (error.code === PG_UNIQUE_VIOLATION) {
            if (error.constraint === 'one_store_per_user')
              throw new ConflictException({
                message: STORE_ALREADY_EXISTS,
              });
          }
        }
        throw error;
      });

    return {
      name: result.name,
      ownerId: result.ownerId,
    };
  }
}
