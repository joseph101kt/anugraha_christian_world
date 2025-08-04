'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  query: string;
  message: string;
  timestamp: string;
  source_url: string | null;
  status: 'New' | 'Contacted' | 'Closed';
}

interface LeadsListProps {
  password: string;
}



export default function LeadsList({ password }: LeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalQuery, setModalQuery] = useState<string | null>(null);


  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leads?password=${encodeURIComponent(password)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    if (password) {
      fetchLeads();
    }
  }, [password]);

  const handleDelete = async (leadId: string) => {
    if (!password) {
      alert('Authentication error: Password is required to delete leads.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await fetch(`/api/leads/${leadId}?password=${encodeURIComponent(password)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          alert('Failed to delete lead.');
          return;
        }

        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        alert('Lead deleted successfully!');
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('An unexpected error occurred.');
      }
    }
  };
  
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (!password) {
      alert('Authentication error: Password is required to change lead status.');
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}?password=${encodeURIComponent(password)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        alert('Failed to update lead status.');
        return;
      }

      const updatedLead = await response.json();
      setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? updatedLead.lead : lead));
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('An unexpected error occurred.');
    }
  };

  if (loading) {
    return <div className="text-center">Loading leads...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-secondary rounded-box shadow-xl">
    <h2 className="text-3xl font-bold mb-6 ">Manage Leads</h2>
    {leads.length === 0 ? (
        <p className="text-center text-lg ">No leads found.</p>
    ) : (
        <div className="overflow-x-auto">
        <table className="table w-full table-fixed">
            <thead className="bg-secondary border-2 border-accent ">
            <tr className="text-text">
                <th className="text-black">Name</ th>
                <th className="text-black">Phone</th>
                <th className="text-black">Message</th>
                <th className="text-black">Status</th>
                <th className="text-black">Delete</th>
            </tr>
            </thead>
            <tbody className='p-4'>
            {leads.map(lead => (
                <tr key={lead.id} className="m-8 border-2 border-accent hover:bg-secondary/20">
                <td>{lead.name}</td>
                <td>{lead.phone}</td>
                <td onClick={() => setModalQuery(lead.query)} className="cursor-pointer">
                    <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {lead.query}
                    </div>
                </td>
                <td>
                    <select
                    className={`select select-sm select-bordered
                        ${lead.status === 'New' ? 'bg-info' : ''}
                        ${lead.status === 'Contacted' ? 'bg-warning' : ''}
                        ${lead.status === 'Closed' ? 'bg-success' : ''}
                    `}
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                    >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                    </select>
                </td>
                <td>
                    <button
                    onClick={() => handleDelete(lead.id)}
                    className="btn btn-sm btn-error text-error-content"
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        {/* The Modal for displaying the full message */}
            <input type="checkbox" id="my-modal-3" className="modal-toggle" checked={!!modalQuery} readOnly />
            <div className="modal">
                <div className="modal-box relative">
                    <label 
                        onClick={() => setModalQuery(null)} 
                        className="btn btn-sm btn-circle absolute right-2 top-2"
                    >
                        ✕
                    </label>
                    <h3 className="text-lg text-white font-bold mb-4">Full Message</h3>
                    <textarea
                        className="textarea text-white textarea-bordered h-48 w-full"
                        value={modalQuery || ''}
                        readOnly
                    />
                </div>
            </div>
        </div>
    )}
    </div>
  );
}