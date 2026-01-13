/**
 * Category to Ionic Icon mapping
 * Maps the 20 standard transaction categories to their respective Ionic icons
 */
import * as icons from 'ionicons/icons';

export const categoryIconMap: Record<string, any> = {
  // ===== 20 STANDARD CATEGORIES =====
  
  'Housing': icons.homeOutline,
  'Utilities': icons.flashOutline,
  'Food': icons.fastFoodOutline,
  'Transport': icons.carOutline,
  'Shopping': icons.cartOutline,
  'Subscriptions': icons.syncCircleOutline,
  'Health': icons.fitnessOutline,
  'Entertainment': icons.flowerOutline,
  'Travel': icons.airplaneOutline,
  'Personal Care': icons.personOutline,
  'Education': icons.schoolOutline,
  'Family & Relationships': icons.peopleOutline,
  'Income': icons.walletOutline,
  'Savings': icons.archiveOutline,
  'Loans & EMIs': icons.cardOutline,
  'Transfers': icons.swapHorizontalOutline,
  'Fees & Charges': icons.receiptOutline,
  'Taxes': icons.documentTextOutline,
  'Donations': icons.heartOutline,
  'Miscellaneous': icons.ellipsisHorizontalCircleOutline,
};

/**
 * Get Ionic icon object for a given category
 * Returns a default icon if category is not found
 */
export const getCategoryIcon = (category: string): any => {
  // Direct match
  if (categoryIconMap[category]) {
    return categoryIconMap[category];
  }
  
  // Case-insensitive match as fallback
  const categoryLower = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (key.toLowerCase() === categoryLower) {
      return value;
    }
  }
  
  // Default icon for any unmapped category
  return icons.ellipsisHorizontalCircleOutline;
};
