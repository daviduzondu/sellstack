import { Injectable } from '@nestjs/common';
import { Insertable } from 'kysely';
import { Db } from 'src/common/decorators/db.decorator';
import { Ordertransactiontype } from 'src/modules/db/generated/types';
import type { Database } from 'src/common/types/types.common';
import { OrderTransactions } from 'src/modules/db/generated/types';

@Injectable()
export class LedgerService {
  constructor(@Db() private readonly db: Database) {}

  private getSignedValue(
    value: number | string | bigint,
    transactionType: Ordertransactiontype,
  ) {
    value = Number(value);
    if (transactionType === Ordertransactiontype.SALE) return Math.abs(value);
    if (
      transactionType === Ordertransactiontype.REFUND ||
      transactionType === Ordertransactiontype.CHARGEBACK ||
      transactionType === Ordertransactiontype.DEBT_RECOVERY
    )
      return 0 - Math.abs(value);
    throw new Error('Failed to get signed value');
  }

  async recordSale(
    payload: Omit<
      Insertable<OrderTransactions>,
      'type' | 'id' | 'createdAt' | 'updatedAt'
    >,
  ) {
    await this.db
      .insertInto('order_transactions')
      .values({
        type: Ordertransactiontype.SALE,
        ...payload,
        amount: this.getSignedValue(payload.amount, Ordertransactiontype.SALE),
      })
      .execute();
    // Ideally this is also where we check and do debt recovery.
  }
}
