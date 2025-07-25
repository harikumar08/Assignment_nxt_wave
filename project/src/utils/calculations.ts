import { LoanCalculation } from '../types';

export const calculateLoan = (
  principal: number,
  years: number,
  interestRate: number
): LoanCalculation => {
  // Simple Interest: I = P * N * R
  const total_interest = principal * years * (interestRate / 100);
  
  // Total Amount: A = P + I
  const total_amount = principal + total_interest;
  
  // Monthly EMI: A / (N * 12)
  const monthly_emi = total_amount / (years * 12);
  
  return {
    total_interest,
    total_amount,
    monthly_emi
  };
};

export const calculateRemainingEMIs = (
  remainingBalance: number,
  monthlyEMI: number
): number => {
  if (remainingBalance <= 0) return 0;
  return Math.ceil(remainingBalance / monthlyEMI);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};