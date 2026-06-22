import { Injectable } from '@nestjs/common';
import { Db } from 'src/common/decorators/db.decorator';
import type { Database } from 'src/common/types/types.common';

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
