import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { DataService } from '../services/dataService';
import { formatCurrency, formatDate } from '../utils/calculations';
import { LedgerResponse } from '../types';

export const LoanLedger: React.FC = () => {
  const [loanId, setLoanId] = useState('');
  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!loanId.trim()) {
      setError('Please enter a loan ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const ledgerData = DataService.getLedger(loanId.trim());
      if (ledgerData) {
        setLedger(ledgerData);
      } else {
        setError('Loan not found');
        setLedger(null);
      }
    } catch (err) {
      setError('Error retrieving ledger data');
      setLedger(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get all loans for suggestions
  const allLoans = DataService.getLoans();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Loan Ledger</h2>
      </div>

      <div className="mb-6">
        <label htmlFor="loan_id_search" className="block text-sm font-medium text-gray-700 mb-2">
          Loan ID
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              id="loan_id_search"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter loan ID or select from list"
              list="loan-suggestions"
            />
            <datalist id="loan-suggestions">
              {allLoans.map(loan => {
                const customer = DataService.getCustomerById(loan.customer_id);
                return (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan_id} - {customer?.name}
                  </option>
                );
              })}
            </datalist>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {ledger && (
        <div className="space-y-6">
          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Principal Amount</span>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(ledger.principal)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Amount</span>
                <div className="font-semibold text-red-600">
                  {formatCurrency(ledger.total_amount)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Amount Paid</span>
                <div className="font-semibold text-green-600">
                  {formatCurrency(ledger.amount_paid)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Balance Amount</span>
                <div className="font-semibold text-orange-600">
                  {formatCurrency(ledger.balance_amount)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Monthly EMI</span>
                <div className="font-semibold text-blue-600">
                  {formatCurrency(ledger.monthly_emi)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">EMIs Left</span>
                <div className="font-semibold text-purple-600">
                  {ledger.emis_left}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Customer ID</span>
                <div className="font-semibold text-gray-900">
                  {ledger.customer_id}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <div className="font-semibold">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ledger.balance_amount <= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ledger.balance_amount <= 0 ? 'PAID OFF' : 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledger.transactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'LOAN_DISBURSED' 
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.type === 'EMI'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {transaction.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={
                          transaction.type === 'LOAN_DISBURSED' 
                            ? 'text-blue-600' 
                            : 'text-green-600'
                        }>
                          {transaction.type === 'LOAN_DISBURSED' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {transaction.transaction_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};