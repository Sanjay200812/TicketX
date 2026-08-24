"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, User, Phone, Tag, Hash, FileText, Send, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TicketXHeading } from '@/components/shared/TicketXHeading';

const CATEGORIES = [
  'Booking Support',
  'Payment Issue',
  'Ticket Issue',
  'Theatre Issue',
  'Event Issue',
  'Account / Login Issue',
  'Feedback',
  'Other',
];

export default function ContactUsPage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Booking Support');
  const [bookingId, setBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill name and email from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          category,
          booking_id: bookingId.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to send message. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setLoading(false);
      setError('Network error occurred. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Support Hub
        </Link>

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-white/10">
          <TicketXHeading
            subtitle="Need help with a booking, payment, theatre, event or your TicketX account? Send us a message."
            size="lg"
            icon={<MessageSquare className="w-7 h-7" />}
          >
            Contact Us
          </TicketXHeading>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading text-white">Message Sent Successfully</h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Thank you for contacting TicketX. Our support team has received your request.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setSubject('');
                  setMessage('');
                  setBookingId('');
                }}
                variant="outline"
                className="rounded-xl text-xs font-bold border-white/15"
              >
                Send Another Message
              </Button>
              <Link href="/my-bookings">
                <Button className="rounded-xl text-xs font-bold">Go to My Bookings</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl">
            {error && (
              <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Full Name <span className="text-primary">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email Address <span className="text-primary">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
              </div>
            </div>

            {/* Phone & Booking ID Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Booking ID (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. TX-89421"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-sm uppercase font-mono"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Category <span className="text-primary">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Subject <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="Brief summary of your query"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-black/40 border-white/10 text-white text-sm"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Message <span className="text-primary">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe your issue or feedback in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-primary focus:outline-none custom-scrollbar"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl font-bold py-6 gap-2 text-sm shadow-[0_0_20px_rgba(216,33,50,0.3)]"
            >
              {loading ? 'Sending Message...' : 'SEND MESSAGE'}
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
