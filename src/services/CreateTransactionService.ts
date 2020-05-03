// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository, Repository } from 'typeorm';

import Transaction, { transactionType } from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface TransactionRequest {
  title: string;
  value: number;
  type: transactionType;
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: TransactionRequest): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    await this.canPerformanceTransaction(transactionsRepository, value, type);

    const category = await this.getCategory(categoryTitle);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }

  private async getCategory(categoryTitle: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const categoryExists = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    if (categoryExists) {
      return categoryExists;
    }

    const category = categoryRepository.create({ title: categoryTitle });
    await categoryRepository.save(category);

    return category;
  }

  private async canPerformanceTransaction(
    transactionsRepository: TransactionsRepository,
    value: number,
    type: transactionType,
  ): Promise<void> {
    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Insufficient funds');
      }
    }
  }
}

export default CreateTransactionService;
