import React, { useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { DataService } from '../services/dataService';
import { formatCurrency } from '../utils/calculations';

interface MakePaymentProps {
  onPaymentMade: () => void;
}

export const MakePayment: React.FC<MakePaymentProps> = ({ onPaymentMade }) => {
  const [formData, setFormData] = useState({
    loan_id: '',
    amount: '',
    payment_type: 'EMI' as 'EMI' | 'LUMP_SUM'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Load loan details when loan_id changes
    if (name === 'loan_id' && value) {
      const ledger = DataService.getLedger(value);
      setLoanDetails(ledger);
    } else if (name === 'loan_id' && !value) {
      setLoanDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loanDetails) {
      alert('Please select a valid loan');
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    
    if (paymentAmount > loanDetails.balance_amount) {
      alert(`Payment amount cannot exceed the remaining balance of ${formatCurrency(loanDetails.balance_amount)}`);
      return;
    }

    setIsLoading(true);
    
    try {
      const payment = DataService.createPayment({
        loan_id: formData.loan_id,
        amount: paymentAmount,
        payment_type: formData.payment_type
      });

      alert(`Payment recorded successfully! Payment ID: ${payment.payment_id}`);
      
      // Reset form
      setFormData({
        loan_id: '',
        amount: '',
        payment_type: 'EMI'
      });
      setLoanDetails(null);
      onPaymentMade();
      
    } catch (error) {
      alert('Error recording payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all active loans for the dropdown
  const loans = DataService.getLoans().filter(loan => {
    const ledger = DataService.getLedger(loan.loan_id);
    return ledger && ledger.balance_amount > 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Make Payment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="loan_id" className="block text-sm font-medium text-gray-700 mb-2">
            Select Loan
          </label>
          <select
            id="loan_id"
            name="loan_id"
            value={formData.loan_id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select Loan</option>
            {loans.map(loan => {
              const customer = DataService.getCustomerById(loan.customer_id);
              return (
                <option key={loan.loan_id} value={loan.loan_id}>
                  {loan.loan_id} - {customer?.name} ({formatCurrency(loan.principal_amount)})
                </option>
              );
            })}
          </select>
        </div>

        {loanDetails && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Balance Amount:</span>
                <div className="font-semibold text-blue-900">
                  {formatCurrency(loanDetails.balance_amount)}
                </div>
              </div>
              <div>
                <span className="text-blue-700">Monthly EMI:</span>
                <div className="font-semibold text-blue-900">
                  {formatCurrency(loanDetails.monthly_emi)}
                </div>
              </div>
              <div>
                <span className="text-blue-700">EMIs Left:</span>
                <div className="font-semibold text-blue-900">
                  {loanDetails.emis_left}
                </div>
              </div>
              <div>
                <span className="text-blue-700">Amount Paid:</span>
                <div className="font-semibold text-green-600">
                  {formatCurrency(loanDetails.amount_paid)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              id="payment_type"
              name="payment_type"
              value={formData.payment_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="EMI">Regular EMI</option>
              <option value="LUMP_SUM">Lump Sum Payment</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount ($)
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={loanDetails ? `Max: ${loanDetails.balance_amount.toFixed(2)}` : 'Enter amount'}
              />
              {loanDetails && formData.payment_type === 'EMI' && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: loanDetails.monthly_emi.toFixed(2) }))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 hover:text-green-700"
                >
                  Use EMI
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!loanDetails || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            {isLoading ? 'Processing...' : 'Make Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};