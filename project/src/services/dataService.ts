import { Customer, Loan, Payment, LedgerResponse, AccountOverview, Transaction, LoanSummary } from '../types';
import { calculateRemainingEMIs } from '../utils/calculations';

const STORAGE_KEYS = {
  CUSTOMERS: 'bank_customers',
  LOANS: 'bank_loans',
  PAYMENTS: 'bank_payments'
};

export class DataService {
  // Customers
  static getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static createCustomer(name: string): Customer {
    const customers = this.getCustomers();
    const customer: Customer = {
      customer_id: `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      created_at: new Date().toISOString()
    };
    customers.push(customer);
    this.saveCustomers(customers);
    return customer;
  }

  static getCustomerById(customerId: string): Customer | null {
    const customers = this.getCustomers();
    return customers.find(c => c.customer_id === customerId) || null;
  }

  // Loans
  static getLoans(): Loan[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOANS);
    return data ? JSON.parse(data) : [];
  }

  static saveLoans(loans: Loan[]): void {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }

  static createLoan(loan: Omit<Loan, 'loan_id' | 'created_at'>): Loan {
    const loans = this.getLoans();
    const newLoan: Loan = {
      ...loan,
      loan_id: `LOAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    loans.push(newLoan);
    this.saveLoans(loans);
    return newLoan;
  }

  static getLoanById(loanId: string): Loan | null {
    const loans = this.getLoans();
    return loans.find(l => l.loan_id === loanId) || null;
  }

  static updateLoan(loan: Loan): void {
    const loans = this.getLoans();
    const index = loans.findIndex(l => l.loan_id === loan.loan_id);
    if (index !== -1) {
      loans[index] = loan;
      this.saveLoans(loans);
    }
  }

  // Payments
  static getPayments(): Payment[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  }

  static savePayments(payments: Payment[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  static createPayment(payment: Omit<Payment, 'payment_id' | 'payment_date'>): Payment {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      payment_id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_date: new Date().toISOString()
    };
    payments.push(newPayment);
    this.savePayments(payments);
    return newPayment;
  }

  static getPaymentsByLoanId(loanId: string): Payment[] {
    const payments = this.getPayments();
    return payments.filter(p => p.loan_id === loanId);
  }

  // Business Logic
  static getLedger(loanId: string): LedgerResponse | null {
    const loan = this.getLoanById(loanId);
    if (!loan) return null;

    const payments = this.getPaymentsByLoanId(loanId);
    const amount_paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance_amount = Math.max(0, loan.total_amount - amount_paid);
    const emis_left = calculateRemainingEMIs(balance_amount, loan.monthly_emi);

    const transactions: Transaction[] = [
      {
        transaction_id: `LOAN_CREATE_${loan.loan_id}`,
        date: loan.created_at,
        amount: loan.principal_amount,
        type: 'LOAN_DISBURSED'
      },
      ...payments.map(p => ({
        transaction_id: p.payment_id,
        date: p.payment_date,
        amount: p.amount,
        type: p.payment_type
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      loan_id: loan.loan_id,
      customer_id: loan.customer_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      monthly_emi: loan.monthly_emi,
      amount_paid,
      balance_amount,
      emis_left,
      transactions
    };
  }

  static getAccountOverview(customerId: string): AccountOverview | null {
    const loans = this.getLoans().filter(l => l.customer_id === customerId);
    if (loans.length === 0) return null;

    const loanSummaries: LoanSummary[] = loans.map(loan => {
      const payments = this.getPaymentsByLoanId(loan.loan_id);
      const amount_paid = payments.reduce((sum, p) => sum + p.amount, 0);
      const balance_amount = Math.max(0, loan.total_amount - amount_paid);
      const emis_left = calculateRemainingEMIs(balance_amount, loan.monthly_emi);

      return {
        loan_id: loan.loan_id,
        principal: loan.principal_amount,
        total_amount: loan.total_amount,
        total_interest: loan.total_amount - loan.principal_amount,
        emi_amount: loan.monthly_emi,
        amount_paid,
        emis_left,
        status: balance_amount <= 0 ? 'PAID_OFF' : 'ACTIVE'
      };
    });

    return {
      customer_id: customerId,
      total_loans: loans.length,
      loans: loanSummaries
    };
  }

  // Initialize sample data
  static initializeSampleData(): void {
    const customers = this.getCustomers();
    if (customers.length === 0) {
      const sampleCustomers = [
        { customer_id: 'CUST_001', name: 'John Doe', created_at: new Date().toISOString() },
        { customer_id: 'CUST_002', name: 'Jane Smith', created_at: new Date().toISOString() },
        { customer_id: 'CUST_003', name: 'Bob Johnson', created_at: new Date().toISOString() }
      ];
      this.saveCustomers(sampleCustomers);
    }
  }
}