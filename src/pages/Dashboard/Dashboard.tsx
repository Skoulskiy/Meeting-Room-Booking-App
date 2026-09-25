import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { Room } from "../../types";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Loader } from "../../components/Loader/Loader";
import { auth } from "../../services/firebase";

import { Input } from "../../components/Input";

export const Dashboard: React.FC = () => {
  const [toast, setToast] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const navigate = useNavigate();

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const roomRef = doc(db, 'rooms', editingRoom.id); 

      const updatedData = {
        name: editingRoom.name,
        capacity: Number(editingRoom.capacity),
        description: editingRoom.description
      };
      await updateDoc(roomRef, updatedData);

      const updatedRoom = {
        ...editingRoom,
        ...updatedData
      };

      setRooms(prev => prev.map(room => 
        room.id === editingRoom.id ? updatedRoom : room
      ));

      setEditingRoom(null);
    } catch (error) {
      console.error("Failed to update room: ", error);
    }
  }; 

  const location = useLocation();

  const handleDeleteClick = (roomId: string) => {
    setRoomToDelete(roomId);
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      await deleteDoc(doc(db, 'rooms', roomToDelete));
      setRooms(prev => prev.filter(room => room.id !== roomToDelete));
      setRoomToDelete(null);
    } catch (error) {
      console.error('Failed to delete room: ', error);
    }
  }

  useEffect(() => {
    if(location.state?.successMessage) {
      setToast(location.state.successMessage);
      window.history.replaceState({}, '');

      const timeout = setTimeout(() => {
        setToast('');
      }, 5000);

      return () => {clearTimeout(timeout)}
    };
  }, [location.state]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'rooms'));
        const roomsData: Room[] = [];

        snapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });

        setRooms(roomsData);
      } catch(error) {
        console.error('Failed to load rooms: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="p-4 text-xl relative max-w-3xl mx-auto">
      {toast && (
        <div className="
          w-full h-10 mb-6 bg-green-500 text-white
          flex items-center justify-center rounded-lg
          shadow-sm font-medium"
        >
          {toast}
        </div>
      )}

      <h1 className="text-3xl font-bold text-white mb-6">All Rooms</h1>

      {loading ? (
        <div className="flex justify-center mt-12">
          <Loader /> 
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">{room.name}</h3>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  {room.capacity} people
                </span>
              </div>
              
              <p className="text-gray-300 text-base mb-6">
                {room.description}
              </p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700">
              <button 
                onClick={() => navigate(`/room/${room.id}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md"
              >
                Book Room
              </button>

              {auth.currentUser?.uid === room.ownerId && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingRoom(room)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteClick(room.id)}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            </div>
          ))}
        </div>
      )}

      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Room?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this room? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Room</h3>
            
            <form onSubmit={handleUpdateRoom} className="flex flex-col gap-6">
              <Input 
                id="edit-name"
                label="Title"
                value={editingRoom.name}
                onChange={(e) => setEditingRoom({...editingRoom, name: e.target.value})}
                required
              />
              
              <Input 
                id="edit-capacity"
                type="number"
                min="1"
                max="100"
                label="Capacity"
                value={editingRoom.capacity.toString()}
                onChange={(e) => setEditingRoom({...editingRoom, capacity: Number(e.target.value)})}
                required
              />

              <div className="relative z-0 w-full group mt-2">
                <textarea
                  id="edit-description"
                  value={editingRoom.description}
                  onChange={(e) => setEditingRoom({...editingRoom, description: e.target.value})}
                  placeholder=" "
                  rows={4}
                  className="
                    peer block w-full appearance-none border-0 border-b-2
                    border-gray-600 bg-transparent px-0 py-2.5 text-sm
                    text-white focus:border-blue-500 focus:outline-none
                    focus:ring-0 transition-colors resize-none
                  "
                  required
                />
                <label
                  htmlFor="edit-description"
                  className="
                    pointer-events-none absolute top-3 z-10
                    origin-[0] -translate-y-6 scale-75
                    transform text-sm text-gray-400 duration-300
                    peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                    peer-focus:-translate-y-6 peer-focus:scale-75
                    peer-focus:text-blue-500 peer-focus:font-medium
                  "
                >
                  Room description
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}