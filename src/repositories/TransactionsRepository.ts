import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    let balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    balance = transactions.reduce((previousBalance, currentTransaction) => {
      const accumulatorBalance = previousBalance;
      if (currentTransaction.type === 'income') {
        accumulatorBalance.income += Number(currentTransaction.value);
      }

      if (currentTransaction.type === 'outcome') {
        accumulatorBalance.outcome += Number(currentTransaction.value);
      }

      return accumulatorBalance;
    }, balance);

    return {
      ...balance,
      total: balance.income - balance.outcome,
    };
  }
}

export default TransactionsRepository;
