import React, { useState } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { DataService } from '../services/dataService';
import { calculateLoan, formatCurrency } from '../utils/calculations';
import { Customer } from '../types';

interface CreateLoanProps {
  customers: Customer[];
  onLoanCreated: () => void;
}

export const CreateLoan: React.FC<CreateLoanProps> = ({ customers, onLoanCreated }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate: ''
  });
  
  const [calculation, setCalculation] = useState<{
    total_amount: number;
    monthly_emi: number;
    total_interest: number;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset calculation when inputs change
    if (calculation) {
      setCalculation(null);
      setShowPreview(false);
    }
  };

  const calculatePreview = () => {
    const { loan_amount, loan_period_years, interest_rate } = formData;
    
    if (!loan_amount || !loan_period_years || !interest_rate) {
      alert('Please fill in all loan details to calculate');
      return;
    }

    const principal = parseFloat(loan_amount);
    const years = parseFloat(loan_period_years);
    const rate = parseFloat(interest_rate);

    if (principal <= 0 || years <= 0 || rate < 0) {
      alert('Please enter valid positive numbers');
      return;
    }

    const calc = calculateLoan(principal, years, rate);
    setCalculation({
      total_amount: calc.total_amount,
      monthly_emi: calc.monthly_emi,
      total_interest: calc.total_interest
    });
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculation) {
      alert('Please calculate the loan details first');
      return;
    }

    setIsLoading(true);
    
    try {
      const loan = DataService.createLoan({
        customer_id: formData.customer_id,
        principal_amount: parseFloat(formData.loan_amount),
        total_amount: calculation.total_amount,
        interest_rate: parseFloat(formData.interest_rate),
        loan_period_years: parseFloat(formData.loan_period_years),
        monthly_emi: calculation.monthly_emi,
        status: 'ACTIVE'
      });

      alert(`Loan created successfully! Loan ID: ${loan.loan_id}`);
      
      // Reset form
      setFormData({
        customer_id: '',
        loan_amount: '',
        loan_period_years: '',
        interest_rate: ''
      });
      setCalculation(null);
      setShowPreview(false);
      onLoanCreated();
      
    } catch (error) {
      alert('Error creating loan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Create New Loan</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name} ({customer.customer_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount ($)
            </label>
            <input
              type="number"
              id="loan_amount"
              name="loan_amount"
              value={formData.loan_amount}
              onChange={handleInputChange}
              required
              min="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter loan amount"
            />
          </div>

          <div>
            <label htmlFor="loan_period_years" className="block text-sm font-medium text-gray-700 mb-2">
              Loan Period (Years)
            </label>
            <input
              type="number"
              id="loan_period_years"
              name="loan_period_years"
              value={formData.loan_period_years}
              onChange={handleInputChange}
              required
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter loan period"
            />
          </div>

          <div>
            <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (% per year)
            </label>
            <input
              type="number"
              id="interest_rate"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleInputChange}
              required
              min="0"
              max="50"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter interest rate"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={calculatePreview}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calculate
          </button>
        </div>

        {showPreview && calculation && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Loan Calculation Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Interest:</span>
                <div className="font-semibold text-orange-600">
                  {formatCurrency(calculation.total_interest)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-semibold text-red-600">
                  {formatCurrency(calculation.total_amount)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Monthly EMI:</span>
                <div className="font-semibold text-blue-600">
                  {formatCurrency(calculation.monthly_emi)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!calculation || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Loan'}
          </button>
        </div>
      </form>
    </div>
  );
};