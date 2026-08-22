"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [type, setType] = useState<string>('General Feedback');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !message.trim()) {
      setError('Please provide a title and message for your feedback.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          type,
          rating,
          title,
          message,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      setLoading(false);
      setError('A network error occurred. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-secondary/40 border border-white/10 p-8 rounded-3xl text-center space-y-5 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Thank You</h2>
          <p className="text-sm text-gray-300">
            Thank you for your feedback. Our product and engineering teams continuously review suggestions to keep TicketX state-of-the-art.
          </p>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full rounded-xl font-bold py-5 bg-primary text-white"
          >
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-4 shadow-lg">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">Send Feedback</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Tell us about your experience, suggest improvements, or report bugs.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-secondary/30 border border-white/10 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
          {/* Star Rating (1-5) */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Overall Experience Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Feedback Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none"
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Booking Experience">Booking Experience</option>
              <option value="Payment Experience">Payment Experience</option>
              <option value="Theatre Experience">Theatre Experience</option>
              <option value="Feature Suggestion">Feature Suggestion</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Title / Topic *</label>
            <Input
              required
              placeholder="e.g. Smooth seat booking experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black/50 border-white/10 text-white text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Your Message *</label>
            <textarea
              required
              rows={4}
              placeholder="Tell us what you liked or what we can improve..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-primary outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-2xl font-extrabold text-base shadow-[0_0_20px_rgba(216,33,50,0.3)]"
          >
            {loading ? 'Submitting Feedback...' : 'SUBMIT FEEDBACK'}
          </Button>
        </form>
      </div>
    </div>
  );
}
