'use client';

import React, { useState, useEffect } from 'react';

// Define the shape of a Lead object for type safety
interface Lead {
  id: string;
  name: string;
  phone: string;
  query: string;
  timestamp: string | null;
  source_url: string | null;
  status: 'New' | 'Contacted' | 'Closed';
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalQuery, setModalQuery] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const showStatusModal = (message: string) => setStatusMessage(message);
  const closeStatusModal = () => setStatusMessage(null);
  const confirmDelete = (leadId: string) => {
    setLeadToDelete(leadId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowDeleteModal(false);
    if (!leadToDelete) return;

    try {
      const response = await fetch(`/api/leads/${leadToDelete}`, { method: 'DELETE' });
      if (!response.ok) {
        showStatusModal('Failed to delete lead.');
        return;
      }
      showStatusModal('Lead deleted successfully!');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting lead:', error);
      showStatusModal('An unexpected error occurred.');
    } finally {
      setLeadToDelete(null);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        showStatusModal('Failed to update lead status.');
        return;
      }

      const updatedLead = await response.json();
      setLeads(prevLeads =>
        prevLeads.map(lead => (lead.id === leadId ? updatedLead.lead : lead))
      );
    } catch (error) {
      console.error('Error updating lead status:', error);
      showStatusModal('An unexpected error occurred.');
    }
  };

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leads`);
        if (!response.ok) throw new Error('Failed to fetch leads');

        const data: Lead[] = await response.json();

        // Sort safely with null timestamp fallback
        const sortedLeads = data.sort(
          (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
        );

        setLeads(sortedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-medium text-gray-500 animate-pulse">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-7xl bg-white p-6 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Manage Leads</h2>

        {leads.length === 0 ? (
          <p className="text-center text-xl text-gray-500">No leads found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                    <td
                      onClick={() => setModalQuery(lead.query)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{lead.query}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        className={`
                          py-1 px-2 rounded-lg text-white font-medium
                          ${lead.status === 'New' ? 'bg-blue-500' : ''}
                          ${lead.status === 'Contacted' ? 'bg-yellow-500' : ''}
                          ${lead.status === 'Closed' ? 'bg-green-500' : ''}
                        `}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => confirmDelete(lead.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition-colors duration-200 shadow"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals for full message, delete, and status */}
        {modalQuery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <button onClick={() => setModalQuery(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">✕</button>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Full Message</h3>
              <textarea className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50" value={modalQuery} readOnly />
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Deletion</h3>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this lead? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200">Cancel</button>
                <button onClick={handleDeleteConfirmed} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">Delete</button>
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Status</h3>
              <p className="mb-6 text-gray-600">{statusMessage}</p>
              <div className="flex justify-center">
                <button onClick={closeStatusModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
