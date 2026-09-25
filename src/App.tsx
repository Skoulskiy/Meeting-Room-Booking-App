import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { setUser } from './store/slices/authSlice';

import './styles/global.css';

import { Loader } from './components/Loader';

import { Dashboard } from './pages/Dashboard';
import { Authentication } from './pages/Authentication';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
          })
        )
      } else {
        dispatch(setUser(null));
      }
    })

    return () => unsubscribe();
  }, [dispatch]);

  if (isLoading) {
    return <Loader fullScreen />; 
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Routes>
        <Route 
          path='/'
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />}
        />

        <Route 
          path='/auth'
          element={!isAuthenticated ? <Authentication /> : <Navigate to="/" replace />}
        />

        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;