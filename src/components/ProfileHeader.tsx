import { IonHeader, IonToolbar, IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { UserProfile } from '../services/authService';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile }) => {
  // Format user name: "Mariana S." format (first name + first letter of last name)
  const formatUserName = (name: string | null): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const displayName = userProfile 
    ? (userProfile.name ? formatUserName(userProfile.name) : userProfile.email.split('@')[0])
    : 'User';

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <div className="flex items-center justify-between w-full px-4 py-3">
          {/* Left: Avatar + Name */}
          <div className="flex items-center gap-3">
            {/* Profile picture */}
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={userProfile?.picture ?? '/default-profile-pic.png'}
                alt="Profile"
                className="w-full h-full object-cover mx-auto my-auto"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile-pic.png'; }}
              />
            </div>

            {/* Welcome text */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-400">Welcome</span>
              <span className="text-lg font-semibold text-gray-900">{displayName}</span>
            </div>
          </div>

          {/* Right side - Notification bell */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-10 h-10 rounded-full! bg-yellow-400 flex items-center justify-center shadow-md active:opacity-90 transition-opacity">
                <IonIcon 
                  icon={notificationsOutline} 
                  className="text-white text-xl"
                  style={{ fontSize: '20px' }}
                />
              </button>
              <span className="absolute -top-1 -right-1 align-text-top w-4 h-4 bg-red-500 rounded-full shadow-sm font-sm text-white" ></span>
            </div>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default ProfileHeader;

