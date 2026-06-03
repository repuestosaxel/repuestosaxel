import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api/response";
import {
  createExpense,
  getFinanceSummary,
  listExpenses
} from "@/lib/services/finance.service";
import { createExpenseSchema } from "@/lib/validations/finance";

export async function GET() {
  try {
    const [summary, expenses] = await Promise.all([getFinanceSummary(), listExpenses()]);
    return apiSuccess({ summary, expenses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = createExpenseSchema.parse(await request.json());
    const { date, ...input } = body;
    const expense = await createExpense({
      ...input,
      expenseDate: date ? new Date(date) : undefined
    });
    return apiSuccess(expense, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
