export interface Customer {
  customer_id: string;
  name: string;
  created_at: string;
}

export interface Loan {
  loan_id: string;
  customer_id: string;
  principal_amount: number;
  total_amount: number;
  interest_rate: number;
  loan_period_years: number;
  monthly_emi: number;
  status: 'ACTIVE' | 'PAID_OFF';
  created_at: string;
}

export interface Payment {
  payment_id: string;
  loan_id: string;
  amount: number;
  payment_type: 'EMI' | 'LUMP_SUM';
  payment_date: string;
}

export interface LoanCalculation {
  total_interest: number;
  total_amount: number;
  monthly_emi: number;
}

export interface LedgerResponse {
  loan_id: string;
  customer_id: string;
  principal: number;
  total_amount: number;
  monthly_emi: number;
  amount_paid: number;
  balance_amount: number;
  emis_left: number;
  transactions: Transaction[];
}

export interface Transaction {
  transaction_id: string;
  date: string;
  amount: number;
  type: string;
}

export interface AccountOverview {
  customer_id: string;
  total_loans: number;
  loans: LoanSummary[];
}

export interface LoanSummary {
  loan_id: string;
  principal: number;
  total_amount: number;
  total_interest: number;
  emi_amount: number;
  amount_paid: number;
  emis_left: number;
  status: string;
}