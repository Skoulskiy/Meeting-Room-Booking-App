import { useState } from "react";
import { Input } from "../../components/Input/Input";

import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from "../../services/firebase"; 
import { useNavigate } from "react-router-dom";

export const CreateRoom: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '', 
    description: ''
  });

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [event.target.id]: event.target.value
    }));
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      alert("You must be logged in to create a room.");
      return;
    }

    try {
      await addDoc(collection(db, 'rooms'), { 
        ...formData, 
        capacity: parseInt(formData.capacity),
        accessList: [
          {
            email: currentUser.email,
            role: 'Admin'
          }
        ],
        ownerId: currentUser.uid 
      });

      navigate('/', { state: { successMessage: 'Room successfully created!'}});
    } catch(error) {
      console.error("Error while room creating: ", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Creating room</h1>
        <p className="mt-2 text-gray-400">Add a new room for bookings</p>
      </header>

      <form className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 flex flex-col gap-6" onSubmit={handleSubmit}>
        
        <Input 
          id="name"
          label="Title"
          onChange={handleChange}
          value={formData.name}
          required
        />
        
        <Input 
          id="capacity"
          type="number"
          min="1"
          max="100"
          label="Capacity"
          onChange={handleChange}
          value={formData.capacity}
          required
        />

        <div className="relative z-0 w-full group mt-2">
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
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
            htmlFor="description"
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

        <button
          type="submit" 
          className="
            mt-4 w-full rounded-lg bg-blue-600
            p-3.5 text-sm font-semibold text-white
            shadow-md hover:bg-blue-500 active:scale-[0.98]
            transition-all focus:ring-4 focus:ring-blue-500/30
          "
        >
          Create room
        </button>
      </form>
    </div>
  )
};