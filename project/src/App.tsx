import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  CreditCard, 
  FileText, 
  User, 
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CreateLoan } from './components/CreateLoan';
import { MakePayment } from './components/MakePayment';
import { LoanLedger } from './components/LoanLedger';
import { AccountOverview } from './components/AccountOverview';
import { CreateCustomer } from './components/CreateCustomer';
import { DataService } from './services/dataService';
import { Customer } from './types';

type ActiveTab = 'dashboard' | 'create-loan' | 'make-payment' | 'ledger' | 'overview' | 'create-customer';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load customers and initialize sample data
  useEffect(() => {
    DataService.initializeSampleData();
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const customerList = DataService.getCustomers();
    setCustomers(customerList);
  };

  const handleDataChange = () => {
    loadCustomers();
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'create-customer', label: 'Create Customer', icon: UserPlus },
    { id: 'create-loan', label: 'Create Loan', icon: Plus },
    { id: 'make-payment', label: 'Make Payment', icon: CreditCard },
    { id: 'ledger', label: 'Loan Ledger', icon: FileText },
    { id: 'overview', label: 'Account Overview', icon: User },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'create-customer':
        return <CreateCustomer onCustomerCreated={handleDataChange} />;
      case 'create-loan':
        return <CreateLoan customers={customers} onLoanCreated={handleDataChange} />;
      case 'make-payment':
        return <MakePayment onPaymentMade={handleDataChange} />;
      case 'ledger':
        return <LoanLedger />;
      case 'overview':
        return <AccountOverview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden bg-white shadow-sm p-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:relative inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg lg:shadow-none
        `}>
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Bank System</h1>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;