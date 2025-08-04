interface LeadData {
  name: string;
  phone: string;
  query: string; // Ensure this line is present and spelled correctly
}

export async function saveLead(leadData: LeadData) {
  const response = await fetch('/api/save-lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save lead');
  }

  return response.json();
}