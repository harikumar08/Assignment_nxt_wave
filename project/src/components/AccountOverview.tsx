import React, { useState } from 'react';
import { User, Search, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { DataService } from '../services/dataService';
import { formatCurrency } from '../utils/calculations';
import { AccountOverview as AccountOverviewType, Customer } from '../types';

export const AccountOverview: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [overview, setOverview] = useState<AccountOverviewType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!customerId.trim()) {
      setError('Please enter a customer ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const overviewData = DataService.getAccountOverview(customerId.trim());
      if (overviewData) {
        setOverview(overviewData);
      } else {
        setError('No loans found for this customer');
        setOverview(null);
      }
    } catch (err) {
      setError('Error retrieving account data');
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get all customers for suggestions
  const allCustomers = DataService.getCustomers();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
      </div>

      <div className="mb-6">
        <label htmlFor="customer_id_search" className="block text-sm font-medium text-gray-700 mb-2">
          Customer ID
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              id="customer_id_search"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter customer ID or select from list"
              list="customer-suggestions"
            />
            <datalist id="customer-suggestions">
              {allCustomers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.customer_id} - {customer.name}
                </option>
              ))}
            </datalist>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {overview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Loans</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {overview.total_loans}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Borrowed</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(overview.loans.reduce((sum, loan) => sum + loan.principal, 0))}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Total Outstanding</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(overview.loans.reduce((sum, loan) => sum + (loan.total_amount - loan.amount_paid), 0))}
              </div>
            </div>
          </div>

          {/* Loans Table */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Loan Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly EMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMIs Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overview.loans.map((loan) => (
                    <tr key={loan.loan_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {loan.loan_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(loan.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(loan.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                        {formatCurrency(loan.total_interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(loan.emi_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(loan.amount_paid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.emis_left}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'PAID_OFF' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {loan.status.replace('_', ' ')}
                        </span>
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