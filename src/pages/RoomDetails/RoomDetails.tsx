import { useEffect, useState } from "react";
import type { Room } from "../../types";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader"; 

export const RoomDetails: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  const [bookings, setBookings] = useState<any[]>([]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth.currentUser) {
      setError("You must be logged in to book a room.");
      return;
    }

    if (bookingData.startTime >= bookingData.endTime) {
      setError("End time must be after start time!");
      return;
    }

    try {
      const bookingRef = collection(db, 'bookings');
      const q = query(
        bookingRef,
        where('roomId', '==', id),
        where('date', '==', bookingData.date)
      );

      const snapshot = await getDocs(q);

      let hasConflicts = false;

      snapshot.forEach(doc => {
        const existingBooking = doc.data();
        if (bookingData.startTime < existingBooking.endTime && bookingData.endTime > existingBooking.startTime) {
          hasConflicts = true;
        }
      });

      if (hasConflicts) {
        setError("This room is already booked for the selected time! Please choose another.");
        return;
      }

      const newBookingObj = {
        roomId: id,
        creatorId: auth.currentUser.uid,
        title: bookingData.title,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        participants: [auth.currentUser.email] 
      };

      const addedDoc = await addDoc(bookingRef, newBookingObj);

      setBookings(prev => {
        const updated = [...prev, { id: addedDoc.id, ...newBookingObj }];
        return updated.sort((a, b) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });
      });

      setIsBookingModalOpen(false);
      setBookingData({ title: '', date: '', startTime: '', endTime: '' });
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Failed to create booking. Please try again.");
    }
  }

  const handleJoinBooking = async (bookingId: string) => {
    if(!auth.currentUser?.email) return;

    try {
      const bookingRef = doc(db, 'bookings', bookingId);

      await updateDoc(bookingRef, {
        participants: arrayUnion(auth.currentUser.email)
      });

      setBookings(prev => prev.map(booking => {
        if (booking.id === bookingId) {
          return {
            ...booking,
            participants: [...booking.participants, auth.currentUser!.email]
          };
        }
        return booking;
      }));
    } catch (error) {
      console.error("Error joining booking:", error);
      setError("Failed to join the meeting.");
    }
  }

  useEffect(() => {
    if (!id) return;
  
    const fetchData = async () => {
      try {
        const roomRef = doc(db, 'rooms', id);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
        }

        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('roomId', '==', id)
        );
        const bookingsSnap = await getDocs(q);
        
        const loadedBookings = bookingsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        loadedBookings.sort((a: any, b: any) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });

        setBookings(loadedBookings);

      } catch (error) {
        console.error('Error while loading data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Room not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Go back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="
          text-gray-400 hover:text-white mb-8 
          flex items-center gap-2 transition-colors font-medium
        "
      >
        <span>←</span> Back to rooms
      </button>

      <div className="
        bg-gray-800 p-8 rounded-2xl border 
        border-gray-700 mb-8 shadow-lg
      ">
        <div className="flex justify-between items-start mb-6 gap-4">
          <h1 className="text-4xl font-bold text-white break-words">{room.name}</h1>
          <span className="
            bg-blue-500/20 text-blue-400 px-4 py-2 
            rounded-xl text-sm font-bold whitespace-nowrap
          ">
            {room.capacity} people
          </span>
        </div>
        
        <p className="text-gray-300 text-lg leading-relaxed">
          {room.description}
        </p>
      </div>

      <div className="
        bg-gray-800 p-8 rounded-2xl border 
        border-gray-700 shadow-lg
      ">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Bookings</h2>
          <button 
            className="
              bg-blue-600 hover:bg-blue-500 text-white 
              px-5 py-2.5 rounded-lg text-sm font-semibold 
              transition-colors shadow-md
            " 
            onClick={() => setIsBookingModalOpen(true)}
          >
            + New Booking
          </button>
        </div>
        
        <div className="
          border-2 border-dashed border-gray-700 
          rounded-xl p-12 flex items-center justify-center 
          text-gray-500
        ">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <p className="mb-2">No bookings yet.</p>
              <p className="text-sm">Be the first to book this room!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="
                    bg-gray-700/30 border border-gray-700 rounded-xl p-5 
                    flex justify-between items-center hover:bg-gray-700/50 
                    transition-colors w-full
                  "
                >
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{booking.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>
                        {booking.date}
                      </span>
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-3">
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">
                        {booking.participants.length} {booking.participants.length === 1 ? 'Participant' : 'Participants'}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-600" title={booking.participants.join(', ')}>
                        {booking.participants[0]} {booking.participants.length > 1 && `+${booking.participants.length - 1}`}
                      </span>
                    </div>
                    
                    {booking.participants.includes(auth.currentUser?.email) ? (
                      <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-500/20 font-medium">
                        ✓ You joined
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleJoinBooking(booking.id)}
                        className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg transition-colors border border-blue-500/30 font-medium"
                      >
                        Join Meeting
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="
          fixed inset-0 z-50 flex items-center justify-center 
          bg-black/60 backdrop-blur-sm p-4
        ">
          <div className="
            bg-gray-800 p-8 rounded-2xl border 
            border-gray-700 w-full max-w-md shadow-2xl
          ">
            <h3 className="text-2xl font-bold text-white mb-6">Book this room</h3>

            {error && (
              <div className="
                mb-6 p-3 rounded-lg bg-red-500/10 
                border border-red-500/50 text-red-500 
                text-sm font-medium
              ">
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreateBooking} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Meeting Title</label>
                <input 
                  type="text" 
                  required
                  value={bookingData.title}
                  onChange={(e) => setBookingData({...bookingData, title: e.target.value})}
                  className="
                    w-full bg-transparent border-b-2 border-gray-600 
                    px-0 py-2 text-white focus:border-blue-500 
                    focus:outline-none transition-colors
                  "
                  placeholder="e.g. Weekly Sync"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  className="
                    w-full bg-gray-700 border border-gray-600 
                    rounded-lg px-3 py-2 text-white focus:border-blue-500 
                    focus:outline-none
                  "
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                    className="
                      w-full bg-gray-700 border border-gray-600 
                      rounded-lg px-3 py-2 text-white focus:border-blue-500 
                      focus:outline-none
                    "
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                    className="
                      w-full bg-gray-700 border border-gray-600 
                      rounded-lg px-3 py-2 text-white focus:border-blue-500 
                      focus:outline-none
                    "
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => { setIsBookingModalOpen(false); setError(null); }}
                  className="
                    px-5 py-2.5 text-sm font-medium text-gray-300 
                    hover:text-white bg-gray-700/50 hover:bg-gray-700 
                    rounded-lg transition-colors
                  "
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="
                    px-5 py-2.5 text-sm font-medium text-white 
                    bg-blue-600 hover:bg-blue-500 rounded-lg 
                    transition-colors shadow-md
                  "
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};