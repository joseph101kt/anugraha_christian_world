'use client';

import { useState, FormEvent } from 'react'; // Import FormEvent
import { FaWhatsapp } from 'react-icons/fa';

import { saveLead } from '@/components/saveLead';

export default function WhatsAppFAB() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [query, setQuery] = useState('');


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Correct type annotation for the event parameter
  const handleWhatsAppSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !query || !phone) {
      alert('Please fill out  your name, phone number and query.');
      return;
    }
    try {
      await saveLead({ name, phone, query });
    } catch (error) {
      console.error('Submission error:', error);
    }

    const message = `Hello, my name is ${name}. Phone nuber is: ${phone} I have a question: ${query}`;
    const encodedMessage = encodeURIComponent(message);
    
    // Replace <your_phone_number> with your WhatsApp number (e.g., 1234567890)
    const whatsappUrl = `https://wa.me/919346851977?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    setIsChatOpen(false);
    setName('');
    setPhone('');
    setQuery('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
        aria-label="Open WhatsApp chat"
      >
        <FaWhatsapp size={24} />
      </button>

      {/* The Chat Interface (conditionally rendered) */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 max-w-[90vw] bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-black font-bold">Chat with us</h3>
            <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              &times;
            </button>
          </div>
          <form onSubmit={handleWhatsAppSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-black text-black shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Your Question
              </label>
              <textarea
                id="query"
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-black py-2 px-4 rounded-md font-bold hover:bg-green-600 transition-colors"
            >
              Start Chat
            </button>
          </form>
        </div>
      )}
    </>
  );
}