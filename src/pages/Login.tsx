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
        <div className="flex flex-col items-center justify-center h-screen px-5">
          <IonButton
            expand="block"
            size="large"
            className="w-full max-w-[300px] font-medium normal-case"
            style={{
              '--background': '#ffffff',
              '--color': '#3c4043',
              '--border-radius': '8px',
              '--box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)'
            } as React.CSSProperties}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IonSpinner name="crescent" slot="start" className="mx-2" />
                Connecting...
              </>
            ) : (
              <>
                <IonIcon icon={logoGoogle} slot="start" className="mx-2" />
                Sign in with Google
              </>
            )}
          </IonButton>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded max-w-[300px] w-full text-sm">
              {error}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

