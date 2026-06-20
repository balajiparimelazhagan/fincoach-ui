import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import authService from '../services/authService';

/**
 * Web OAuth callback handler.
 *
 * On native (Capacitor) the backend redirect is caught as a deep link in
 * Login.tsx via the `appUrlOpen` listener. On web there is no deep link: the
 * backend redirects the browser to `/auth/callback?token=...&refresh_token=...`,
 * so this route reads the tokens from the query string, persists them, and
 * forwards the user to the dashboard.
 */
const AuthCallback: React.FC = () => {
  const history = useHistory();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refreshToken = params.get('refresh_token');

      if (!token) {
        setError('Authentication failed: no token received');
        history.replace('/login');
        return;
      }

      await authService.setAccessToken(token);
      if (refreshToken) {
        await authService.setRefreshToken(refreshToken);
      }
      history.replace('/dashboard');
    };

    completeLogin();
  }, [history]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          {error ? (
            <div className="p-2 px-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          ) : (
            <IonSpinner name="dots" className="text-primary" />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthCallback;
