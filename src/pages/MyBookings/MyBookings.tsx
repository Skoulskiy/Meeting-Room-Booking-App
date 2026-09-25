import { useEffect, useState } from "react"
import { auth, db } from "../../services/firebase"
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore"
import type { Booking } from "../../types"
import { Loader } from "../../components/Loader"

export const MyBookings : React.FC = () => {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'cancel' | 'leave' | null;
    bookingId: string | null;
  }>({
    isOpen: false,
    action: null,
    bookingId: null
  });

  const [manageModal, setManageModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });

  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!auth.currentUser?.email) return;

      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('participants', 'array-contains', auth.currentUser.email)
      );

      try {
        const snapshot = await getDocs(q);
        const loadedBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));

        loadedBookings.sort((a: any, b: any) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });

        setBookings(loadedBookings);
      } catch (error) {
        console.error("Error loading my bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, []);

  const openCancelModal = (bookingId: string) => {
    setConfirmModal({ isOpen: true, action: 'cancel', bookingId });
  };

  const openLeaveModal = (bookingId: string) => {
    setConfirmModal({ isOpen: true, action: 'leave', bookingId });
  };

  const handleConfirmAction = async () => {
    const { action, bookingId } = confirmModal;
    if (!bookingId) return;

    try {
      if(action === 'cancel') {
        await deleteDoc(doc(db, 'bookings', bookingId));
      } else if (action === 'leave' && auth.currentUser?.email) {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
          participants: arrayRemove(auth.currentUser.email)
        });
      }
      setBookings(prev => prev ? prev.filter(b => b.id !== bookingId) : null);
    } catch (error) {
      console.error(`Error during ${action} booking:`, error);
    } finally {
      setConfirmModal({ isOpen: false, action: null, bookingId: null });
    }
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantEmail || !manageModal.booking) return;

    // Перевірка, чи юзер вже є в мітингу
    if (manageModal.booking.participants.includes(newParticipantEmail)) {
      alert("This user is already in the meeting!");
      setNewParticipantEmail('');
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', manageModal.booking.id);
      await updateDoc(bookingRef, {
        participants: arrayUnion(newParticipantEmail)
      });

      setManageModal(prev => prev.booking ? {
        ...prev,
        booking: { ...prev.booking, participants: [...prev.booking.participants, newParticipantEmail] }
      } : prev);

      setBookings(prev => prev ? prev.map(b => b.id === manageModal.booking?.id ? { ...b, participants: [...b.participants, newParticipantEmail] } : b) : null);
      
      setNewParticipantEmail('');
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  const handleRemoveParticipant = async (emailToRemove: string) => {
    if (!manageModal.booking) return;

    if (emailToRemove === auth.currentUser?.email) {
      alert("You can't remove yourself! Use the Cancel Meeting button if you want to delete it.");
      return;
    }

    try {
      const bookingRef = doc(db, 'bookings', manageModal.booking.id);
      await updateDoc(bookingRef, {
        participants: arrayRemove(emailToRemove)
      });

      const updatedParticipants = manageModal.booking.participants.filter(p => p !== emailToRemove);

      setManageModal(prev => prev.booking ? {
        ...prev,
        booking: { ...prev.booking, participants: updatedParticipants }
      } : prev);

      setBookings(prev => prev ? prev.map(b => b.id === manageModal.booking?.id ? { ...b, participants: updatedParticipants } : b) : null);
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">My Bookings</h1>
      </div>

      {(!bookings || bookings.length === 0) ? (
        <div className="
          bg-gray-800 border-2 border-dashed border-gray-700
          rounded-2xl p-12 flex flex-col items-center 
          justify-center text-gray-500 shadow-lg">
          <p className="text-xl mb-2 text-gray-400">You have no upcoming meetings.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => {
            const isCreator = booking.creatorId === auth.currentUser?.uid;

            return (
              <div 
                key={booking.id} 
                className="
                bg-gray-800 border border-gray-700 rounded-2xl p-6 
                flex flex-col sm:flex-row justify-between items-start 
                sm:items-center gap-4 hover:border-gray-600
                transition-colors shadow-md"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{booking.title}</h3>
                    {isCreator && (
                      <span className="
                        bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded 
                        text-xs font-bold border border-blue-500/20"
                      >
                        Host
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">{booking.date}</span>
                    <span className="flex items-center gap-1">{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex gap-3">
                  {isCreator ? (
                    <>
                      <button 
                        onClick={() => setManageModal({ isOpen: true, booking })}
                        className="
                          px-4 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white 
                          text-blue-400 border border-blue-500/50 rounded-lg text-sm 
                          font-semibold transition-colors"
                      >
                        Manage Users
                      </button>
                      <button 
                        onClick={() => openCancelModal(booking.id)}
                        className="
                          px-4 py-2 bg-red-500/10 hover:bg-red-500 
                          hover:text-white text-red-500 border border-red-500/50 rounded-lg
                          text-sm font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => openLeaveModal(booking.id)}
                      className="
                        px-4 py-2 bg-gray-700 hover:bg-gray-600
                        text-gray-300 hover:text-white border 
                        border-gray-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Leave Meeting
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {manageModal.isOpen && manageModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Manage Participants</h3>
              <button 
                onClick={() => { setManageModal({ isOpen: false, booking: null }); setNewParticipantEmail(''); }}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddParticipant} className="flex gap-2 mb-6">
              <input 
                type="email" 
                required
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                placeholder="Enter user email..."
                className="
                  flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
                  text-white focus:border-blue-500 focus:outline-none text-sm"
              />
              <button 
                type="submit"
                className="
                  px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg 
                  text-sm font-semibold transition-colors shadow-md"
              >
                Add User
              </button>
            </form>
            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-700">
                {manageModal.booking.participants.map((email) => {
                  const isHost = email === auth.currentUser?.email;
                  return (
                    <li key={email} className="flex justify-between items-center p-4 hover:bg-gray-800 transition-colors">
                      <span className="text-sm text-gray-300">
                        {email} {isHost && <span className="ml-2 text-xs text-blue-400 font-bold">(You)</span>}
                      </span>
                      
                      {!isHost && (
                        <button 
                          onClick={() => handleRemoveParticipant(email)}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-3">
              {confirmModal.action === 'cancel' ? 'Cancel Meeting?' : 'Leave Meeting?'}
            </h3>
            
            <p className="text-gray-400 text-sm mb-6">
              {confirmModal.action === 'cancel' 
                ? 'Are you sure you want to cancel this booking for everyone? This action cannot be undone.' 
                : 'Are you sure you want to leave this meeting?'}
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, action: null, bookingId: null })}
                className="
                  px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white 
                  bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                No, keep it
              </button>
              <button 
                onClick={handleConfirmAction}
                className="
                  px-5 py-2.5 text-sm font-medium text-white
                  bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-md"
              >
                Yes, {confirmModal.action === 'cancel' ? 'cancel' : 'leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}