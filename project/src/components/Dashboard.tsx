import React from 'react';
import { Building2, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { DataService } from '../services/dataService';
import { formatCurrency } from '../utils/calculations';

export const Dashboard: React.FC = () => {
  // Calculate dashboard statistics
  const loans = DataService.getLoans();
  const customers = DataService.getCustomers();
  const payments = DataService.getPayments();

  const totalLoansAmount = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
  const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => {
    const ledger = DataService.getLedger(loan.loan_id);
    return sum + (ledger ? ledger.balance_amount : 0);
  }, 0);

  const activeLoans = loans.filter(loan => {
    const ledger = DataService.getLedger(loan.loan_id);
    return ledger && ledger.balance_amount > 0;
  }).length;

  const paidOffLoans = loans.length - activeLoans;

  // Recent transactions (last 10)
  const recentTransactions = payments
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Bank Lending System</h1>
        </div>
        <p className="text-blue-100">
          Manage loans, process payments, and track customer accounts efficiently
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              <p className="text-xs text-green-600">{activeLoans} active, {paidOffLoans} paid off</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoansAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
              <p className="text-xs text-gray-500">Collected: {formatCurrency(totalPaymentsAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(payment => {
                const loan = DataService.getLoanById(payment.loan_id);
                const customer = loan ? DataService.getCustomerById(loan.customer_id) : null;
                return (
                  <div key={payment.payment_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{payment.loan_id}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">{payment.payment_type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent payments</p>
          )}
        </div>

        {/* Active Loans Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Loans Summary</h3>
          {activeLoans > 0 ? (
            <div className="space-y-3">
              {loans
                .filter(loan => {
                  const ledger = DataService.getLedger(loan.loan_id);
                  return ledger && ledger.balance_amount > 0;
                })
                .slice(0, 5)
                .map(loan => {
                  const ledger = DataService.getLedger(loan.loan_id)!;
                  const customer = DataService.getCustomerById(loan.customer_id);
                  return (
                    <div key={loan.loan_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{loan.loan_id}</p>
                        <p className="text-xs text-gray-400">
                          {ledger.emis_left} EMIs left
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(ledger.balance_amount)}
                        </p>
                        <p className="text-xs text-gray-500">remaining</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active loans</p>
          )}
        </div>
      </div>
    </div>
  );
};