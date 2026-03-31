import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, MapPin, Search, Filter, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react';
import Navbar from '../components/Navbar';
import OutpassModal from '../components/OutpassModal';
import { GlassCard, Button } from '../components/ui';
import { getOutpasses } from '../api/localStorageDB';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../utils/cn';


const StudentDashboard = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showQR, setShowQR] = useState(null);

  const fetchOutpasses = async () => {
    try {
      const { data } = await getOutpasses();
      setOutpasses(data);
    } catch (err) {
      toast.error('Failed to load outpasses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const filteredOutpasses = outpasses.filter(op => 
    filter === 'all' ? true : op.status === filter
  );

  const StatusBadge = ({ status }) => {
    const config = {
      pending: { icon: AlertCircle, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', text: 'Pending' },
      approved: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', text: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20', text: 'Rejected' },
    };
    const { icon: Icon, color, text } = config[status] || config.pending;
    
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="pt-28 pb-12 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2"
            >
              My Outpasses
            </motion.h1>
            <p className="text-gray-400">Track and manage your hostel leave requests</p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="md:w-auto w-full py-4 text-base shadow-indigo-500/20"
          >
            <Plus className="mr-2 w-5 h-5" /> Apply for Outpass
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl border transition-all duration-300 text-sm font-medium capitalize",
                filter === f ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "glass border-white/10 text-gray-400 hover:bg-white/5"
              )}
            >

              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 glass animate-pulse rounded-2xl"></div>)}
          </div>
        ) : filteredOutpasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOutpasses.map((op, idx) => (
                <GlassCard key={op._id} delay={idx * 0.1} className="flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge status={op.status} />
                    {op.status === 'approved' && (
                      <button 
                        onClick={() => setShowQR(op)}
                        className="p-2 glass rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-lg"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 glass rounded-lg flex items-center justify-center text-teal-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Destination</p>
                        <p className="font-semibold text-white">{op.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 glass rounded-lg flex items-center justify-center text-indigo-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Duration</p>
                        <p className="text-sm font-medium text-gray-300">
                          {new Date(op.fromDate).toLocaleDateString()} - {new Date(op.toDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-white/10 pt-4">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Reason</p>
                    <p className="text-sm text-gray-400 line-clamp-2 italic">“{op.reason}”</p>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border-dashed border-2 border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-400">No outpasses found</h3>
            <p className="text-gray-500">Try changing your filters or apply for a new one</p>
          </div>
        )}
      </main>

      <OutpassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchOutpasses} 
      />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQR(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="z-[210] w-full max-w-sm">
              <GlassCard className="p-8 text-center border-indigo-500/30">
                <div className="bg-white p-4 rounded-2xl mb-6 shadow-2xl shadow-white/10 inline-block">
                  <QRCodeSVG value={`PASS_ID:${showQR._id}_USER:${showQR.userId}`} size={200} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Validated Pass</h3>
                <p className="text-gray-400 text-sm mb-6">Present this QR at the gate for quick exit verification.</p>
                <Button variant="primary" className="w-full" onClick={() => setShowQR(null)}>Close</Button>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;

