import { useState } from "react";
import { IonHeader, IonToolbar, IonIcon, IonActionSheet } from "@ionic/react";
import { refreshOutline, chevronDownOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { UserProfile } from "../services/authService";
import ProfileIcon from "./ProfileIcon";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  selectedMonth: number;   // 0-indexed
  selectedYear: number;
  onMonthSelect: (year: number, month: number) => void;
  onRefresh: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  selectedMonth,
  selectedYear,
  onMonthSelect,
  onRefresh,
}) => {
  const history = useHistory();
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = userProfile
    ? userProfile.name
      ? userProfile.name.trim().split(" ")[0]
      : userProfile.email.split("@")[0]
    : "User";

  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  // Build last 12 months for the action sheet
  const now = new Date();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const isCurrentMonth =
    selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const actionSheetButtons = [
    ...monthOptions.map(opt => ({
      text:
        opt.month === now.getMonth() && opt.year === now.getFullYear()
          ? `${MONTH_NAMES[opt.month]} ${opt.year}  ·  This month`
          : `${MONTH_NAMES[opt.month]} ${opt.year}`,
      handler: () => onMonthSelect(opt.year, opt.month),
    })),
    { text: 'Cancel', role: 'cancel' as const },
  ];

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
              onClick={handleRefresh}
              aria-label="Refresh dashboard"
              className="w-11 h-11 flex items-center justify-center rounded-full active:bg-gray-100"
            >
              <IonIcon
                icon={refreshOutline}
                className={`text-xl text-text-tertiary transition-transform duration-700 ${refreshing ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Month dropdown pill */}
            <button
              onClick={() => setShowPicker(true)}
              aria-label="Select month"
              aria-haspopup="listbox"
              className="flex items-center p-1.5! gap-1.5 border! border-gray-300! bg-white rounded-full rounded-lg! active:bg-gray-50"
            >
              {!isCurrentMonth && (
                <span className="text-xs font-semibold text-gray-800">
                  {MONTH_NAMES[selectedMonth].slice(0, 3)} {selectedYear}
                </span>
              )}
              {isCurrentMonth && (
                <span className="text-xs text-primary font-semibold">· THIS MONTH</span>
              )}
              <IonIcon icon={chevronDownOutline} className="text-[11px] text-gray-400" />
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonActionSheet
        isOpen={showPicker}
        onDidDismiss={() => setShowPicker(false)}
        header="Select month"
        buttons={actionSheetButtons}
      />
    </>
  );
};

export default ProfileHeader;
