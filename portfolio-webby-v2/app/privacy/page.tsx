// app/privacy/page.tsx
import React, { Suspense } from 'react';

export const metadata = {
  title: 'Privacy Policy - [Your Company Name]',
  description: 'Learn about our privacy practices, including the data we collect and how we use it to provide our services.',
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense>
    <div className="container mx-auto p-8 md:p-12 lg:p-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">Privacy Policy</h1>
      <p className="text-sm md:text-base text-center mb-12">
        Last updated: August 9, 2025
      </p>

      <div className="bg-secondary rounded-xl shadow-lg p-6 md:p-10">
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">Introduction</h2>
          <p className="text-base md:text-lg leading-relaxed">
            This Privacy Policy describes how we collect, use, and protect the information you provide when using our services. By using our website, you agree to the collection and use of your information as described in this policy.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">Information We Collect</h2>
          <p className="text-base md:text-lg leading-relaxed">
            We collect several different types of information for various purposes to provide and improve our service to you. This may include:
          </p>
          <ul className="list-disc list-inside mt-4 text-base md:text-lg space-y-2">
            <li>
              **Personal Data:** Information that can be used to identify you, such as your name and phone number.
            </li>
            <li>
              **Usage Data:** Data on how the service is accessed and used, including your IP address, browser type, and pages visited.
            </li>
            <li>
              **Cookies:** Small files stored on your device that help us remember your preferences and improve your experience.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 border-b-2 pb-2">How We Use Your Data</h2>
          <p className="text-base md:text-lg leading-relaxed">
            We use the collected data for various purposes, including to provide and maintain our service, process your orders, provide customer support, and to improve our products and services. We do not sell your personal data to third parties.
          </p>
        </section>
      </div>
    </div>
    </Suspense>
  );
}