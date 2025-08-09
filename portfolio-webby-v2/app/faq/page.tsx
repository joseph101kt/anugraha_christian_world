// app/faq/page.tsx
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ - [Your Company Name]',
  description: 'Find answers to the most common questions about our products, shipping, and return policies.',
};

export default function FAQPage() {
  return (
    <div className="container mx-auto p-8 md:p-12 lg:p-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">Frequently Asked Questions</h1>
      <p className="text-sm md:text-base text-center mb-12">
        We have got the answers to your most common questions right here.
      </p>

      <div className="space-y-8">
        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">How can I place an order?</h2>
          <p className="text-base md:text-lg">
            To place an order, simply add your desired items to the cart and proceed to the checkout page. Follow the prompts to enter your shipping and payment information to complete your purchase.
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">What payment methods do you accept?</h2>
          <p className="text-base md:text-lg">
            We accept all major credit and debit cards, as well as secure payment options like PayPal and Apple Pay.
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">What is your shipping policy?</h2>
          <p className="text-base md:text-lg">
            We offer various shipping options. Standard shipping typically takes 5-7 business days, while expedited options are also available. You will receive a tracking number once your order has shipped.
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">What is your return policy?</h2>
          <p className="text-base md:text-lg">
            We offer a 30-day return policy for unused items in their original packaging. Please visit our dedicated <Link href="/returns" className="bg-accent text-primary p-1 rounded font-semibold">Returns Page</Link> for detailed instructions and to start the process.
          </p>
        </div>

        <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">How can I contact customer support?</h2>
          <p className="text-base md:text-lg">
            You can reach our customer support team via email at support@[yourcompany.com] or through our contact form. We strive to respond to all inquiries within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}