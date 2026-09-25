import { useState } from "react";
import { useAppSelector } from "../../hooks/redux"
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { NavLink, Outlet, useNavigate } from "react-router-dom";


import { IoExit } from "react-icons/io5";



export const Layout : React.FC = ( ) => {
  const { user } = useAppSelector(state => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch(error) {
      console.error('Error until logout: ', error);
    }
  }

  const initial = user?.name ? user.name[0] : 'U';

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="
        bg-gray-800 border-b border-gray-700
        px-6 py-4 flex justify-between
        items-center relative z-20">
          <div className="text-xl font-bold text-white tracking-wide cursor-pointer" onClick={() => navigate('/', {replace: true})}>
            Room<span className="text-blue-500">Book</span>
          </div>

          <nav className="md: flex gap-6 items-center">
            <NavLink 
              to="/" 
              className={({ isActive }) => `transition-colors ${isActive ? "text-blue-400 font-medium" : "text-gray-400 hover:text-white"}`}
            >All rooms</NavLink>
            <NavLink 
            to="/my-bookings" 
            className={({ isActive }) => `transition-colors ${isActive ? "text-blue-400 font-medium" : "text-gray-400 hover:text-white"}`}
          >
            My Books
          </NavLink>
          <NavLink 
            to="/create-room" 
            className={({ isActive }) => `transition-colors ${isActive ? "text-blue-400 font-medium" : "text-gray-400 hover:text-white"}`}
          >
            Create room
          </NavLink>
        </nav>

        <div className="relative">
          <button 
            onContextMenu={(e) => { e.preventDefault(); setIsProfileOpen(!isProfileOpen)}}
            className="
              h-10 w-10 rounded-full bg-blue-600 flex
              items-center justify-center text-white font-bold
              hover:bg-blue-500 transition-colors focus:outline-none
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              focus:ring-offset-gray-800 select-none">
              {initial}
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsProfileOpen(false)}
              ></div>

              <div className="
                absolute right-0 mt-3 w-56
                bg-gray-800 border border-gray-700
                rounded-xl shadow-2xl z-40
                py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                    <p className="text-sm text-white font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700/50 hover:text-red-300 transition-colors flex items-center gap-2.5 mt-2"
                    >
                      <IoExit /> Logout
                    </button>
                  </div>
                </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <Outlet /> 
      </main>
    </div>
  )
}