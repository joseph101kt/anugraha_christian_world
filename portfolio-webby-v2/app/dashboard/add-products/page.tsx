// app/dashboard/add-product/page.tsx (Updated)
'use client';

import React, { useState } from 'react';
import AddProductForm from '@/components/AddProductForm';

// Replace 'your-secure-password' with a strong, secret password
const ADMIN_PASSWORD = 'password';

export default function AddProductPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <div className="flex justify-center items-center h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-4">Staff Login</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary w-full">
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render the new component if authenticated
  return <AddProductForm password={password} />;
}
