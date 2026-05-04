import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { LogIn, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#EA1D2C] p-3 rounded-2xl text-white">
              <ShoppingBag size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">FoodSaaS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie seu cardápio digital de forma profissional.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-3" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Entrar com Google
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-gray-500">
            Ao se cadastrar, você concorda com nossos Termos de Serviço.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
