"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Film } from "lucide-react";
import { useEffect } from "react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey?: string;
}

export function TrailerModal({ isOpen, onClose, trailerKey }: TrailerModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl z-10 flex items-center justify-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/70 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            
            {trailerKey ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Film className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Trailer Unavailable</h4>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  An official video trailer is not available for this movie right now.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
