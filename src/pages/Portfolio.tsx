import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService, UserProfile } from "../services/authService";
import portfolioData from "../data/portfolioData.json";
import Footer from "../components/Footer";
import ActivityCard from "../components/ActivityCard";
import ProfileIcon from "../components/ProfileIcon";

interface PortfolioItem {
  id: string;
  icon: string;
  name: string;
  amount: number;
  type?: string;
  dueDate?: string;
}

interface PortfolioSection {
  title: string;
  tag: string;
  items: PortfolioItem[];
}

const Portfolio: React.FC = () => {
  const history = useHistory();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const displayEmail = (userProfile?.email || portfolioData.userEmail).split(
    "@"
  )[0];

  const renderSection = (section: PortfolioSection, sectionKey: string) => {
    return (
      <div key={sectionKey} className="mb-5">
        <div className="mb-3 px-1">
          <span className="text font-semibold text-gray-800">
            {section.title}
          </span>
        </div>
        <div className="flex flex-col border bg-white border-gray-200 rounded-xl overflow-hidden">
          {section.items.map((item) => {
            // For credit cards and bills, show negative amount (expense)
            // For income and savings, show positive amount
            const displayAmount =
              sectionKey === "bills" || sectionKey === "creditCards" ? -item.amount : item.amount;
            const subtitle = item.dueDate
              ? `Due: ${item.dueDate}`
              : item.type
              ? item.type
              : section.tag;

            return (
              <ActivityCard
                key={item.id}
                title={item.name}
                date={subtitle}
                amount={displayAmount}
                avatarUrl={undefined}
                customIcon={item.icon}
                category={section.title}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="px-4 py-3">
          <IonButtons slot="start">
            <button
              onClick={() => history.goBack()}
              className="flex items-center gap-1 px-3 py-2"
            >
              <IonIcon
                icon={arrowBackOutline}
                className="text-2xl text-gray-700"
              />
            </button>
          </IonButtons>
          <IonTitle className="text-center font-bold">Portfolio</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        <div className="p-5 pb-24">
          {/* User Info Card */}
          <div className="bg-linear-to-r from-primary to-primary-light rounded-2xl p-5 mb-6 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              {/* <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div> */}
              <ProfileIcon />
              <span className="text-white text-lg font-bold">
                {displayEmail}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white text-xs opacity-75">
                Last fetched on:
              </span>
              <span className="text-white text-xs font-semibold">
                {portfolioData.lastFetched}
              </span>
            </div>
          </div>

          {/* Sections */}
          {renderSection(
            portfolioData.sections.incomes as PortfolioSection,
            "incomes"
          )}
          {renderSection(
            portfolioData.sections.savings as PortfolioSection,
            "savings"
          )}
          {renderSection(
            portfolioData.sections.creditCards as PortfolioSection,
            "creditCards"
          )}
          {renderSection(
            portfolioData.sections.bills as PortfolioSection,
            "bills"
          )}
        </div>
      </IonContent>

      <Footer />
    </IonPage>
  );
};

export default Portfolio;
