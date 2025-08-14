// app/terms/page.tsx
import React from 'react';
export const metadata = {
  title: 'Terms of Service - [Your Company Name]',
  description: 'The terms and conditions that govern the use of our services. By using our site, you agree to these terms.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto p-8 md:p-12 lg:p-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">Terms of Service</h1>
      <p className="text-sm md:text-base text-center mb-12">
        Last updated: August 9, 2025
      </p>

      <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-10">
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">1. Acceptance of Terms</h2>
          <p className="text-base md:text-lg leading-relaxed">
            By accessing and using this website and its services, you accept and agree to be bound by these **Terms of Service**. If you do not agree with these terms, you should not use this website.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">2. Intellectual Property</h2>
          <p className="text-base md:text-lg leading-relaxed">
            The content on this website, including text, graphics, logos, and images, is the exclusive property of Anugraha Christian World and is protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">3. User Conduct</h2>
          <p className="text-base md:text-lg leading-relaxed">
            You agree not to use the service for any unlawful or prohibited purpose. You must not use the website in a way that could damage, disable, or impair the site or interfere with any other partys use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">4. Limitation of Liability</h2>
          <p className="text-base md:text-lg leading-relaxed">
            In no event shall Anugraha Christian World be liable for any damages arising out of the use or inability to use the materials on our website.
          </p>
        </section>
      </div>
    </div>
  );
}