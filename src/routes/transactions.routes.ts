import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import { transactionType } from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const validatedValue = convertToNumber(value);
  const validatedType = convertToTransactionType(type);

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value: validatedValue,
    type: validatedType,
    categoryTitle: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);

  return response.status(204).send();
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;

function convertToNumber(value: string): number {
  const number = parseInt(value, 10);
  return number;
}

function convertToTransactionType(value: string): transactionType {
  if (value === 'outcome') {
    return 'outcome';
  }
  if (value === 'income') {
    return 'income';
  }
  throw new Error('invalid transaction type');
}
