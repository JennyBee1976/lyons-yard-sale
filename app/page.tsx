'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [submitStatus, setSubmitStatus] = useState('');

  const scrollToRegistration = () => {
    const element = document.getElementById('registration');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const submitFormData = async (formData: FormData) => {
    try {
      const response = await fetch('https://readdy.ai/api/form/d26n70qelq606pbtooeg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      return await response.text();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const itemsDescription = formData.get('itemsDescription') as string;
    if (itemsDescription && itemsDescription.length > 500) {
      setSubmitStatus('Items description must be 500 characters or less.');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    const data = Object.fromEntries(formData.entries());

    const prices = {
      'early-bird': 20,
      'regular': 30,
      'day-of': 40
    };

    const basePrice = prices[data.registrationType as keyof typeof prices] || 30;
    const numberOfSpaces = parseInt(data.numberOfSpaces as string) || 1;
    const totalAmount = basePrice * numberOfSpaces;

    const processedFormData = new FormData();
    processedFormData.append('fullName', data.fullName as string);
    processedFormData.append('phone', data.phone as string);
    processedFormData.append('email', data.email as string);
    processedFormData.append('address', data.address as string);

    const registrationTypeLabels = {
      'early-bird': 'Early Bird - $20 (First 20 vendors)',
      'regular': 'Regular - $30',
      'day-of': 'Day Of - $40'
    };
    processedFormData.append('registrationType', registrationTypeLabels[data.registrationType as keyof typeof registrationTypeLabels]);

    const spacesLabels = {
      '1': '1 Space (10x12 ft)',
      '2': '2 Spaces (20x12 ft)',
      '3': '3 Spaces (30x12 ft)'
    };
    processedFormData.append('numberOfSpaces', spacesLabels[data.numberOfSpaces as keyof typeof spacesLabels]);

    processedFormData.append('itemsDescription', data.itemsDescription as string || '');

    if (data.agreeToRules === 'on') {
      processedFormData.append('agreeToRules', 'Agreed to follow all vendor rules and park regulations');
    }
    if (data.bringOwnSupplies === 'on') {
      processedFormData.append('bringOwnSupplies', 'Understands to bring own tables, blankets, and supplies');
    }

    processedFormData.append('basePrice', `$${basePrice}`);
    processedFormData.append('totalAmount', `$${totalAmount}`);

    setSubmitStatus('Submitting registration...');

    try {
      await submitFormData(processedFormData);
    } catch (error) {
      setSubmitStatus('Form submission failed. Please try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
      return;
    }

    setSubmitStatus('Redirecting to payment...');

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      const { url } = await res.json();

      if (url) {
        window.location.href = url;
      } else {
        setSubmitStatus('Stripe checkout session failed.');
        setTimeout(() => setSubmitStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus('Payment setup failed. Try again.');
      setTimeout(() => setSubmitStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Your entire layout and form below remains unchanged */}
      {/* You can paste the rest of your current form and layout components here */}
      {/* Just ensure your <form onSubmit={handleFormSubmit}> is still active */}
    </div>
  );
}
