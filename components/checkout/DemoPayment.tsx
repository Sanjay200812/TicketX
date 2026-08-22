"use client";

import { useState } from 'react';
import { Loader2, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DemoPaymentProps {
  amount: number;
  onSuccess: () => void;
}

export function DemoPayment({ amount, onSuccess }: DemoPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'upi' | 'wallet'>('card');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="bg-secondary/40 border border-white/10 rounded-xl p-6 md:p-8">
      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm p-4 rounded-lg mb-8">
        <strong>DEMO PAYMENT:</strong> No real money will be charged. This is a prototype checkout.
      </div>

      <div className="flex gap-2 mb-8">
        <button 
          onClick={() => setMethod('card')}
          className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-lg border transition-all ${
            method === 'card' ? 'bg-primary/10 border-primary text-white' : 'bg-black/20 border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-xs font-medium">Card</span>
        </button>
        <button 
          onClick={() => setMethod('upi')}
          className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-lg border transition-all ${
            method === 'upi' ? 'bg-primary/10 border-primary text-white' : 'bg-black/20 border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-xs font-medium">UPI</span>
        </button>
        <button 
          onClick={() => setMethod('wallet')}
          className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-lg border transition-all ${
            method === 'wallet' ? 'bg-primary/10 border-primary text-white' : 'bg-black/20 border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-xs font-medium">Wallet</span>
        </button>
      </div>

      <form onSubmit={handlePayment} className="space-y-6">
        {method === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Demo Card Number</label>
              <Input required placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Expiry</label>
                <Input required placeholder="MM/YY" defaultValue="12/28" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">CVV</label>
                <Input required type="password" placeholder="***" defaultValue="123" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Name on Card</label>
              <Input required placeholder="John Doe" defaultValue="Jane Doe" />
            </div>
          </div>
        )}

        {method === 'upi' && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Demo UPI ID</label>
            <Input required placeholder="username@upi" defaultValue="demo@ticketx" />
          </div>
        )}

        {method === 'wallet' && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Demo Wallet Number</label>
            <Input required placeholder="+91 9876543210" defaultValue="+91 9999999999" />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isProcessing} 
          className="w-full h-14 text-lg font-bold mt-8 rounded-xl"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            `Pay ₹${amount}`
          )}
        </Button>
      </form>
    </div>
  );
}
