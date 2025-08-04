// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import AddProductForm from '@/components/AddProductForm';
import DeleteProductList from '@/components/DeleteProductList';
import LeadsList from '@/components/LeadsList';

const ADMIN_PASSWORD = 'password'; //change the password in app/api/products/id/route.ts, app/api/products/route.ts, app/dashboard/page.tsx

type DashboardView = 'add' | 'delete' | 'leads';

export default function DashboardPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('add');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="card w-96 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-4">Staff Login</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered bg-secondary border-accent border-2 w-full"
            />
            <button type="submit" className="btn btn-primary w-full font-semibold text-gray-700">
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

	const renderContent = () => {
	switch (currentView) {
			case 'add':
			return <AddProductForm password={password} />;
			case 'delete':
			// Pass the password prop here
			return <DeleteProductList password={password} />; 
			case 'leads':
			return <LeadsList password={password} />;
			default:
			return <p>Select a dashboard view.</p>;
	}
	};

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <div className="flex mt-4 md:mt-0 space-x-4">
          <button
            onClick={() => setCurrentView('add')}
            className={`btn ${currentView === 'add' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Add Product
          </button>
          <button
            onClick={() => setCurrentView('delete')}
            className={`btn ${currentView === 'delete' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Delete Products
          </button>
          <button
            onClick={() => setCurrentView('leads')}
            className={`btn ${currentView === 'leads' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Manage Leads
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}