import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { DataService } from '../services/dataService';

interface CreateCustomerProps {
  onCustomerCreated: () => void;
}

export const CreateCustomer: React.FC<CreateCustomerProps> = ({ onCustomerCreated }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a customer name');
      return;
    }

    setIsLoading(true);
    
    try {
      const customer = DataService.createCustomer(name.trim());
      alert(`Customer created successfully! Customer ID: ${customer.customer_id}`);
      setName('');
      onCustomerCreated();
    } catch (error) {
      alert('Error creating customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-cyan-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Create New Customer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            type="text"
            id="customer_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Enter customer full name"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};