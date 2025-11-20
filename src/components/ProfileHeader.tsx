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
          {/* Left side - Welcome text */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Welcome</span>
            <span className="text-xl font-bold text-gray-900">{displayName}</span>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center gap-3">
            {/* Notification bell with badge */}
            <div className="relative">
              <button className="w-10 h-10 !rounded-full bg-orange-200 flex items-center justify-center active:bg-orange-300 transition-colors">
                <IonIcon 
                  icon={notificationsOutline} 
                  className="text-yellow-600 text-xl"
                  style={{ fontSize: '20px' }}
                />
              </button>
              {/* Notification badge */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                1
              </span>
            </div>

            {/* Profile picture */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
              {userProfile?.picture ? (
                <img 
                  src={userProfile.picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default ProfileHeader;

