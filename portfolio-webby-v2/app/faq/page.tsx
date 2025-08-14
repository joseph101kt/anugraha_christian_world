// app/faq/page.tsx
import React, { Suspense } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ - Anugraha Christian World',
  description: 'Find answers to the most common questions about our products.',
};

export default function FAQPage() {
  return (
    <Suspense>
    <div className="container mx-auto p-8 md:p-12 lg:p-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">Frequently Asked Questions</h1>
      <p className="text-sm md:text-base text-center mb-12">
        We have got the answers to your most common questions right here.
      </p>

      <div className="space-y-8">
        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h4 className="text-xl md:text-2xl font-bold mb-2">How can I place an order?</h4>
          <p className="text-base md:text-lg">
            Contact us through the <Link href={"/contact"}>Contact page</Link>
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h4 className="text-xl md:text-2xl font-bold mb-2">What payment methods do you accept?</h4>
          <p className="text-base md:text-lg">
            There is no payment method through the website. Payment can be done in store.
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h4 className="text-xl md:text-2xl font-bold mb-2">What is your shipping policy?</h4>
          <p className="text-base md:text-lg">
            We can ship through services like rapido.
          </p>
        </div>


        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h4 className="text-xl md:text-2xl font-bold mb-2">How can I contact customer support?</h4>
          <p className="text-base md:text-lg">
            You can reach us through the <Link href={"/contact"}>Contact page</Link>
          </p>
        </div>
      </div>
    </div>
    </Suspense>
  );
}