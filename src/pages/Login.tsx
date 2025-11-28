import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { useState } from 'react';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { authorization_url } = await authService.initiateGoogleSignIn();
      
      // Redirect to Google's authorization page
      window.location.href = authorization_url;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to initiate Google sign-in';
      setError(errorMessage);
      console.error('Google sign-in error:', err);
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-100">
        <div className="flex flex-col items-center justify-center h-screen px-1">
          <IonButton
            expand="block"
            size="large"
            className="w-auto font-medium normal-case rounded-xl border-2 shadow-white overflow-hidden border-text-secondary"
            style={{
              '--background': '#FFF5F5',
              '--color': '#8A4A64'
            } as React.CSSProperties}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className='text-sm flex items-center font-bold'>
                <IonSpinner name="bubbles" slot="start" className="mx-2" />
                Connecting...
              </div>
            ) : (
              <div className='text-sm flex items-center font-bold'>
                <IonIcon icon={logoGoogle} className="mx-2 text-xl py-0.5" />
                Sign in with Google
              </div>
            )}
          </IonButton>
          {error && (
            <div className="w-auto mt-2 p-1.5 px-3 bg-red-100 border border-red-400 text-red-700 rounded max-w-[300px] text-sm">
              {error}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

