// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import AddProductForm from '@/components/AddProductForm';
import EditProductForm from '@/components/EditProductForm';
import DeleteProductList from '@/components/DeleteProductList';
import LeadsList from '@/components/LeadsList';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

type DashboardView = 'add' | 'edit' | 'delete' | 'leads';

export default function DashboardPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<DashboardView>('add');

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple string comparison for demonstration purposes.
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password. Access denied.');
            setPassword('');
        }
    };
    
    // This is the new function to handle the DELETE API call.
    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                // The API route requires the password in the request body
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Pass the authenticated password from the state
                    body: JSON.stringify({ password }),
                });

                if (response.ok) {
                    // Handle successful deletion, e.g., show a success message or re-fetch data
                    console.log('Product deleted successfully!');
                    alert('Product deleted successfully!');
                    // You might want to re-render the list or perform other actions here.
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    console.error('Failed to delete product:', errorData.message);
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('An unexpected error occurred during deletion:', error);
                alert('An unexpected error occurred.');
            }
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
                            placeholder="Enter Password "
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
                return <AddProductForm />;
            case 'edit':
                return <EditProductForm  />;
            case 'delete':
                // Pass the new handleDeleteProduct function as a prop
                // and the authenticated password.
                return <DeleteProductList onDelete={handleDeleteProduct} password={password} />;
            case 'leads':
                return <LeadsList />;
            default:
                return <p>Select a dashboard view.</p>;
        }
    };

    return (
        <div className=" mx-4 p-4 w-full">
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
                        onClick={() => setCurrentView('edit')}
                        className={`btn ${currentView === 'edit' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Edit Product
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
            <div className='w-full'>
                {renderContent()}
            </div>
        </div>
    );
}
