import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldAlert, Users, Search, Filter, ArrowUpRight, Clock, MapPin, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { GlassCard, Button } from '../components/ui';
import { getOutpasses, updateOutpassStatus } from '../api/localStorageDB';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';


const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await getOutpasses();
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load outpass requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOutpassStatus(id, status);
      toast.success(`Request ${status} successfully`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-28 pb-12 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2"
            >
              Admin Control Panel
            </motion.h1>
            <p className="text-gray-400">Manage hostel outpass approvals and tracking</p>
          </div>
          
          <div className="flex gap-4">
             <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4">
               <div className="text-right">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Total Pending</p>
                 <p className="text-2xl font-bold text-yellow-400 leading-none">
                   {requests.filter(r => r.status === 'pending').length}
                 </p>
               </div>
               <ShieldAlert className="w-8 h-8 text-yellow-500/50" />
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-semibold capitalize",
                filter === f ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10" : "glass border-white/10 text-gray-400 hover:bg-white/5"
              )}
            >
              {f}
            </button>

          ))}
        </div>

        {/* Desktop Table View */}
        <div className="glass rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Student Info</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Destination</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Dates</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-4 h-16 bg-white/2"></td>
                    </tr>
                  ))
                ) : filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{req.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 italic">{req.userId?.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium">{req.destination}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col text-xs text-gray-400">
                        <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-emerald-400" /> {new Date(req.fromDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-red-400/70"><ArrowUpRight className="w-3 h-3 rotate-180" /> {new Date(req.toDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                         req.status === 'pending' ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" :
                         req.status === 'approved' ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" :
                         "bg-red-400/10 text-red-400 border border-red-400/20"
                       )}>
                         {req.status}
                       </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="px-4 py-2 glass rounded-xl text-xs font-bold text-indigo-400 hover:bg-white/10 transition-all"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Details */}
        <AnimatePresence>
          {selectedRequest && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="z-[210] w-full max-w-lg">
                 <GlassCard className="p-8 border-indigo-500/20">
                    <div className="flex justify-between items-start mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                             <FileText className="w-8 h-8" />
                          </div>
                          <div>
                             <h3 className="text-2xl font-bold">{selectedRequest.userId?.name}</h3>
                             <p className="text-gray-400 text-sm">Request Details Summary</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedRequest(null)} className="glass p-2 rounded-lg text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="glass p-5 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest mb-3">Destination & Reason</p>
                          <p className="text-white font-semibold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedRequest.destination}</p>
                          <p className="text-gray-400 text-sm italic">“{selectedRequest.reason}”</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-2xl border-emerald-500/10">
                             <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">From Date</p>
                             <p className="text-white font-medium">{new Date(selectedRequest.fromDate).toLocaleDateString()}</p>
                          </div>
                          <div className="glass p-4 rounded-2xl border-red-500/10">
                             <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest mb-1">To Date</p>
                             <p className="text-white font-medium">{new Date(selectedRequest.toDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <Button variant="primary" className="w-full py-4 text-base" onClick={() => setSelectedRequest(null)}>Acknowledge & Close</Button>
                    </div>
                 </GlassCard>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;

