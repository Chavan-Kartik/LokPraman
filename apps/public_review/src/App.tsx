import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Star, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure this uses the exact host IP to work on mobile devices
const API_URL = 'http://localhost:3001/v0';

interface Worker {
  id: string;
  name: string;
  rating: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  worker?: Worker;
  publicRating?: number | null;
  locationName?: string;
  status?: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchNearbyTasks(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        setError('Please allow location access to see nearby tasks to review.');
        setLoading(false);
      }
    );
  }, []);

  const fetchNearbyTasks = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`${API_URL}/tasks/public/nearby`, {
        params: { lat, lng, radius: 500 }
      });
      setTasks(res.data || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to load nearby tasks. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (taskId: string, score: number) => {
    setRatingLoading(taskId);
    setSuccessMsg(null);
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/rate`, { score });
      setSuccessMsg('Thank you! Your community rating has been recorded.');
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, publicRating: score } 
          : t
      ));
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to submit rating.');
    } finally {
      setRatingLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between max-w-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">LokPraman</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Public Civic Review</p>
        </div>
        <div className="bg-orange-100 p-2 rounded-full">
          <MapPin className="text-orange-500 w-5 h-5" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl p-6">
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader className="w-8 h-8 animate-spin mb-4 text-orange-500" />
            <p className="font-medium animate-pulse">Finding nearby civic tasks...</p>
          </div>
        ) : !error && tasks.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Tasks Nearby</h3>
            <p className="text-gray-500 text-sm">There are no completed LokPraman civic tasks within 500 meters of your current location to review.</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
             {tasks.map(task => (
               <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden relative">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase tracking-wider mb-2">
                        {task.category}
                     </span>
                     <h3 className="text-lg font-bold text-gray-900 leading-tight">{task.title}</h3>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</span>
                     <span className="text-sm font-bold text-green-600">{task.status || 'Verified'}</span>
                   </div>
                 </div>
                 
                 <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
                 
                 {task.locationName && (
                   <div className="flex items-start gap-2 mb-4 text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                     <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                     <span className="line-clamp-2">{task.locationName}</span>
                   </div>
                 )}

                 <div className="border-t border-gray-100 my-4"></div>

                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Worker</span>
                       <span className="text-sm font-bold text-gray-900">{task.worker?.name || 'Assigned Worker'}</span>
                     </div>
                     <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md">
                       <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                       <span className="text-sm font-bold text-orange-700">
                         {task.worker?.rating ? task.worker.rating.toFixed(1) : 'New'}
                       </span>
                     </div>
                   </div>

                   <div className="bg-blue-50/50 rounded-xl p-4 mt-2 border border-blue-100">
                     {task.publicRating ? (
                       <div className="flex flex-col items-center justify-center">
                         <span className="text-sm font-medium text-gray-500 mb-2">You rated this work</span>
                         <div className="flex items-center gap-1">
                           {[1, 2, 3, 4, 5].map(star => (
                             <Star 
                               key={star} 
                               className={cn(
                                 "w-6 h-6", 
                                 star <= task.publicRating! 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-200 fill-gray-200"
                               )} 
                             />
                           ))}
                         </div>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center">
                         <span className="text-sm font-bold text-gray-900 mb-3">Rate this civic work</span>
                         <div className="flex items-center justify-center gap-2">
                           {ratingLoading === task.id ? (
                             <Loader className="w-6 h-6 animate-spin text-blue-500" />
                           ) : (
                             [1, 2, 3, 4, 5].map(star => (
                               <button 
                                 key={star}
                                 onClick={() => submitRating(task.id, star)}
                                 className="p-1 hover:scale-110 active:scale-95 transition-transform"
                               >
                                 <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                               </button>
                             ))
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
