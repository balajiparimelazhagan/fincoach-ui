import { IonHeader, IonToolbar, IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { UserProfile } from '../services/authService';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile }) => {
  const formatUserName = (name: string | null): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts[0];
  };

  const displayName = userProfile 
    ? (userProfile.name ? formatUserName(userProfile.name) : userProfile.email.split('@')[0])
    : 'User';

  return (
    <IonHeader className="ion-no-border rounded-b-2xl overflow-hidden border border-gray-200">
      <IonToolbar>
        <div className="flex items-center justify-between w-full px-4 py-3">
          {/* Profile picture */}
          <div className="w-12 h-12 rounded-full overflow-hidden border">
            <img
              src='/default-profile-pic.png'
              alt="Profile"
              className="w-full h-full object-cover mx-auto my-auto"
            />
          </div>

          {/* Welcome text */}
          <div className="flex flex-col leading-tight text-center">
            <span className="text-sm text-text-secondary">Hello,</span>
            <span className="text-lg font-black text-text-primary">{displayName}</span>
          </div>

          {/* Right side - Notification bell */}
              <button className="mx-1 w-10 h-10 relative">
                <IonIcon 
                  icon={notificationsOutline} 
                  className="text-text-tertiary text-2xl p-2 rounded-full! border border-text-tertiary"
                />
                <span className="absolute top-2 right-1.5 w-3 h-3 bg-primary rounded-full border-2 border-white"></span>
              </button>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default ProfileHeader;

