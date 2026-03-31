import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Send, X } from 'lucide-react';
import { GlassCard, Button } from './ui';
import { Input } from './ui/Input';
import { createOutpass } from '../api/localStorageDB';
import toast from 'react-hot-toast';

const OutpassModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    destination: '',
    reason: '',
    fromDate: '',
    toDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOutpass(formData);
      toast.success('Outpass request submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg z-50"
          >
            <GlassCard className="p-8 border-white/20 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Apply for Outpass</h2>
                  <p className="text-gray-400 text-sm">Please provide your travel details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <Input 
                  label="Destination" 
                  icon={MapPin} 
                  value={formData.destination} 
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="From Date" 
                    type="date" 
                    icon={Calendar} 
                    value={formData.fromDate} 
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                    required 
                  />
                  <Input 
                    label="To Date" 
                    type="date" 
                    icon={Clock} 
                    value={formData.toDate} 
                    onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                    required 
                  />
                </div>

                <div className="relative group mb-8">
                  <textarea
                    placeholder="Reason for travel"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full h-32 glass rounded-xl p-4 text-white outline-none border border-white/10 hover:border-indigo-500/50 focus:border-indigo-500 ring-indigo-500/20 focus:ring-4 transition-all resize-none text-sm"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="ghost" onClick={onClose} className="px-8">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={loading} className="px-10">
                    Submit Request
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OutpassModal;
