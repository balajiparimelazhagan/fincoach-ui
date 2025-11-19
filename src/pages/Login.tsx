import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';

const Login: React.FC = () => {
  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google Sign In clicked');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-100">
        <div className="flex items-center justify-center h-screen px-5">
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
          >
            <IonIcon icon={logoGoogle} slot="start" className="mx-2" />
            Sign in with Google
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;

