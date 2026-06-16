import { Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db';
import type { Database } from 'src/modules/db/db.types';

@Injectable()
export class UserService {
  constructor(@Db() private db: Database) {}

  async getUserById(userId: string) {
    const user = await this.db
      .selectFrom('users')
      .where('id', '=', userId)
      .select(['id', 'name'])
      .executeTakeFirst();

    return user;
  }
}
