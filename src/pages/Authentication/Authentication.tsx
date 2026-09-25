import { useState } from "react";
import { Input } from "../../components/Input";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';

export const Authentication : React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  }

  const strengthScore = getPasswordStrength(password);

  const strengthConfig = [
    {text: '', color: 'bg-gray-600', width: 'w-0'},
    {text: 'Weak', color: 'bg-red-500', width: 'w-1/4'},
    {text: 'Fair', color: 'bg-orange-500', width: 'w-2/4'},
    {text: 'Good', color: 'bg-yellow-400', width: 'w-3/4'},
    {text: 'Strong', color: 'bg-green-500', width: 'w-full'}
  ]

  const currentStrength = strengthConfig[strengthScore];
  const isSubmitDisabled = !isLogin && strengthScore < 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: name
          });
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.code === 'auth/email-already-in-use') setError('This email already registered.');
      else if (err.code === 'auth/invalid-credential') setError('Wrong email or password.');
      else setError('Catched error, please try later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start booking meeting rooms'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <Input 
              id="name"
              type="text"
              label="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
            />
          )}

          <Input 
            id="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <Input 
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Password strength</span>
                  <span className={`text-xs font-medium text-${currentStrength.color.replace('bg-', '')}`}>
                    {currentStrength.text}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${currentStrength.color} ${currentStrength.width}`}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Блок виводу помилки */}
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled || isLoading}
            className="
              mt-4 w-full rounded-lg bg-blue-600
              p-3 text-sm font-semibold text-white
              shadow-md hover:bg-blue-500 focus:ring-4
              focus:ring-blue-500/30 active:scale-[0.98]
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:bg-blue-600 flex justify-center items-center"
          >
            {isLoading ? (
               <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setError(null); // Очищаємо помилку при перемиканні
              }}
              className="font-medium text-blue-400 hover:text-blue-300 hover:underline focus:outline-none"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </footer>
      </section>
    </main>
  );
};