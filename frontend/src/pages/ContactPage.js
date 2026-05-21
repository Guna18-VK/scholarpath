import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import './ContactPage.css';

const FAQs = [
  { q: 'How do I apply for a scholarship?', a: 'Browse scholarships, check your eligibility, and click "Apply Now" on the scholarship details page. You can also visit the official portal link.' },
  { q: 'How are scholarships recommended to me?', a: 'Our system matches your profile (academics, income, community, state, course) with scholarship eligibility criteria to show you the most relevant opportunities.' },
  { q: 'Will I get reminders before deadlines?', a: 'Yes! Save scholarships to receive email reminders 7, 3, and 1 day(s) before the deadline.' },
  { q: 'Is the platform free to use?', a: 'Yes, ScholarPath is completely free for students. We never charge any fees.' },
  { q: 'How do I update my profile for better recommendations?', a: 'Go to Profile page and fill in your academic percentage, annual income, community, state, and course details.' },
  { q: 'Can I download scholarship details?', a: 'Yes! On any scholarship details page, click "Download PDF" to save the information offline.' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero */}
      <div className="contact-hero">
        <div className="container">
          <h1>Contact & Support</h1>
          <p>Have questions? We're here to help you find the right scholarship.</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-cards">
            {[
              { icon: '📧', title: 'Email', value: 'support@scholarpath.com', sub: 'We reply within 24 hours' },
              { icon: '📞', title: 'Phone', value: '1800-XXX-XXXX', sub: 'Mon–Fri, 9AM–6PM IST' },
              { icon: '💬', title: 'Live Chat', value: 'Available on Dashboard', sub: 'AI-powered instant help' },
              { icon: '📍', title: 'Office', value: 'New Delhi, India', sub: 'By appointment only' },
            ].map((c, i) => (
              <div key={i} className="contact-card card">
                <div className="contact-card-icon">{c.icon}</div>
                <div>
                  <div className="contact-card-title">{c.title}</div>
                  <div className="contact-card-value">{c.value}</div>
                  <div className="contact-card-sub">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-section card card-body">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-control" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your question or issue..." />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full">Send Message 📨</button>
          </form>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <p className="section-subtitle text-center">Quick answers to common questions</p>
          <div className="faq-list">
            {FAQs.map((faq, i) => (
              <div key={i} className={`faq-item card ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
