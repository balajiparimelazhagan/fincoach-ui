/**
 * Category to Ionic Icon mapping
 * Maps transaction/wallet categories to their respective Ionic icon objects
 */
import * as icons from 'ionicons/icons';

export const categoryIconMap: Record<string, any> = {
  // Healthcare (Image 1 - heart with pulse)
  'Healthcare': icons.fitnessOutline,
  'Hospital': icons.fitnessOutline,
  'Medicine': icons.fitnessOutline,
  'Medical': icons.fitnessOutline,
  'Health': icons.fitnessOutline,
  'Doctor': icons.fitnessOutline,
  'Pharmacy': icons.fitnessOutline,
  'Health and Wellness': icons.fitnessOutline,
  'Health And Wellness': icons.fitnessOutline,
  
  // Entertainment (Image 2 - gym/fitness)
  'Entertainment': icons.barbellOutline,
  'Gym': icons.barbellOutline,
  'Fitness': icons.barbellOutline,
  'Sports': icons.barbellOutline,
  'Exercise': icons.barbellOutline,
  
  // Shopping (Image 3 - shopping cart)
  'Shopping': icons.cartOutline,
  'Retail': icons.cartOutline,
  'Purchase': icons.cartOutline,
  'Online Shopping': icons.cartOutline,
  
  // Grocery/Utilities (Image 4 - store/shop)
  'Grocery': icons.storefrontOutline,
  'Groceries': icons.storefrontOutline,
  'Supermarket': icons.storefrontOutline,
  'Market': icons.storefrontOutline,
  'Utilities': icons.storefrontOutline,
  
  // Bills - Gas (Image 5 - flame)
  'Gas': icons.flameOutline,
  'Gas Bill': icons.flameOutline,
  'LPG': icons.flameOutline,
  'Fuel': icons.flameOutline,
  
  // Bills - Electricity (Image 6 - bulb)
  'Electricity': icons.bulbOutline,
  'Electricity Bill': icons.bulbOutline,
  'Electric Bill': icons.bulbOutline,
  'Power': icons.bulbOutline,
  'Power Bill': icons.bulbOutline,
  
  // Dining/Food (Image 7 - burger with drink)
  'Dining': icons.fastFoodOutline,
  'Food': icons.fastFoodOutline,
  'Restaurant': icons.fastFoodOutline,
  'Meal': icons.fastFoodOutline,
  'Cafe': icons.cafeOutline,
  'Coffee': icons.cafeOutline,
  
  // Additional categories from Image 8
  'Bills': icons.receiptOutline,
  'Subscription': icons.syncOutline,
  'Transportation': icons.carOutline,
  'Transport': icons.carOutline,
  'Travel': icons.airplaneOutline,
  'Refund': icons.arrowUndoOutline,
  'Other': icons.ellipsisHorizontalCircleOutline,
  'UPI Transfer': icons.swapHorizontalOutline,
  'Transfer': icons.swapHorizontalOutline,
  'Income': icons.cashOutline,
  'Salary': icons.walletOutline,
  
  // Telecom
  'Telecom': icons.phonePortraitOutline,
  'Telecom Wallet': icons.phonePortraitOutline,
  'Mobile': icons.phonePortraitOutline,
  'Phone': icons.phonePortraitOutline,
  'Internet': icons.wifiOutline,
  
  // Rewards
  'Rewards': icons.giftOutline,
  'Cashback': icons.giftOutline,
  'Points': icons.giftOutline,
  
  // Insurance
  'Insurance': icons.shieldCheckmarkOutline,
  
  // Education
  'Education': icons.schoolOutline,
  'Books': icons.bookOutline,
  
  // Rent
  'Rent': icons.homeOutline,
  'Housing': icons.homeOutline,
  
  // Investment
  'Investment': icons.trendingUpOutline,
  'Savings': icons.walletOutline,
  
  // Personal Care
  'Personal Care': icons.bodyOutline,
  'Beauty': icons.sparklesOutline,
  
  // Pets
  'Pets': icons.pawOutline,
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
  
  // Case-insensitive search
  const categoryLower = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (key.toLowerCase() === categoryLower) {
      return value;
    }
  }
  
  // Partial match search
  for (const [key, value] of Object.entries(categoryIconMap)) {
    if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
      return value;
    }
  }
  
  // Default icon
  return icons.ellipsisHorizontalCircleOutline;
};
