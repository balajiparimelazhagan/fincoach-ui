import { useState } from "react";
import { IonHeader, IonToolbar, IonIcon } from "@ionic/react";
import { cloudDownloadOutline, refreshOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { UserProfile } from "../services/authService";
import ProfileIcon from "./ProfileIcon";


interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onSync: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  onSync,
}) => {
  const history = useHistory();
  const [sync, setSync] = useState(false);

  const displayName = userProfile
    ? userProfile.name
      ? userProfile.name.trim().split(" ")[0]
      : userProfile.email.split("@")[0]
    : "User";

  const handleSync = async () => {
    setSync(true);
    onSync();
    setTimeout(() => setSync(false), 800);
  };

  // Build last 12 months for the action sheet
  const now = new Date();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <>
      <IonHeader className="ion-no-border rounded-b-2xl overflow-hidden border border-gray-200">
        <IonToolbar>
          <div className="flex items-center gap-3 w-full px-4 py-3">

            {/* Left: profile pic + greeting */}
            <ProfileIcon onClick={() => history.push("/portfolio")} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-text-secondary">Hello,</span>
              <span className="text-base font-black text-text-primary">{displayName}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Refresh */}
            <button
              onClick={handleSync}
              aria-label="Refresh dashboard"
              className="flex items-center justify-center mr-4"
            >
              <IonIcon
                icon={cloudDownloadOutline}
                className={`w-7 h-7 text-primary text-text-tertiary transition-opacity ${sync ? 'opacity-50' : 'opacity-100'}`}
              />
            </button>
          </div>
        </IonToolbar>
      </IonHeader>
    </>
  );
};

export default ProfileHeader;
