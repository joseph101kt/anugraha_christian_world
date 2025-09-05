// components/ContactFormWrapper.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import ContactForm from './ContactForm';

export default function ContactFormWrapper() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  return <ContactForm initialMessage={initialQuery} />;
}