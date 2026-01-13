/**
 * Category Auto-Mapper Utility
 * Automatically maps transactions to categories based on transactor name and patterns
 */

interface CategoryRule {
  keywords: string[];
}

/**
 * Category mapping rules with keywords
 */
const CATEGORY_RULES: Record<string, string[]> = {
  'Housing': [
    'rent', 'mortgage', 'property tax', 'housing society', 'maintenance',
    'apartment', 'flat', 'hoa', 'association', 'society maintenance'
  ],
  
  'Utilities': [
    'electricity', 'power', 'bescom', 'mseb', 'water bill', 'sewage',
    'municipal', 'gas', 'lpg', 'cylinder', 'internet', 'broadband',
    'wifi', 'airtel', 'jio', 'bsnl', 'tata sky', 'dish tv'
  ],
  
  'Food': [
    'swiggy', 'zomato', 'uber eats', 'restaurant', 'cafe', 'coffee',
    'mcdonald', 'kfc', 'domino', 'pizza', 'food', 'grocery',
    'supermarket', 'bigbasket', 'amazon fresh', 'dmart', 'reliance fresh',
    'more', 'star bazaar', 'spencer'
  ],
  
  'Transport': [
    'uber', 'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'hp', 'bharat petroleum',
    'indian oil', 'shell', 'metro', 'bus', 'train', 'irctc', 'fastag',
    'parking', 'toll', 'taxi'
  ],
  
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping',
    'retail', 'store', 'mall', 'shopper', 'lifestyle', 'pantaloons',
    'westside', 'max fashion', 'h&m', 'zara', 'decathlon'
  ],
  
  'Subscriptions': [
    'netflix', 'prime', 'hotstar', 'spotify', 'youtube premium',
    'apple music', 'subscription', 'membership', 'annual fee',
    'renewal', 'recurring'
  ],
  
  'Health': [
    'hospital', 'clinic', 'doctor', 'pharmacy', 'medicine', 'apollo',
    'fortis', 'max healthcare', 'manipal', 'medplus', 'netmeds',
    '1mg', 'pharmeasy', 'gym', 'fitness', 'yoga', 'cult fit'
  ],
  
  'Entertainment': [
    'movie', 'cinema', 'pvr', 'inox', 'game', 'gaming', 'steam',
    'playstation', 'xbox', 'sports', 'event', 'concert', 'show',
    'theatre', 'bookmyshow', 'paytm insider'
  ],
  
  'Travel': [
    'flight', 'airline', 'indigo', 'spicejet', 'air india', 'vistara',
    'makemytrip', 'goibibo', 'cleartrip', 'hotel', 'oyo', 'treebo',
    'airbnb', 'booking.com', 'travel', 'vacation', 'trip'
  ],
  
  'Personal Care': [
    'salon', 'spa', 'beauty', 'grooming', 'parlor', 'barber',
    'lakme', 'vlcc', 'natural', 'wellness'
  ],
  
  'Education': [
    'school', 'college', 'university', 'tuition', 'course', 'udemy',
    'coursera', 'byju', 'unacademy', 'books', 'stationery',
    'exam fee', 'education'
  ],
  
  'Family & Relationships': [
    'gift', 'birthday', 'anniversary', 'wedding', 'ferns n petals',
    'archies', 'hallmark', 'flower', 'celebration'
  ],
  
  'Income': [
    'salary', 'refund', 'cashback', 'credit', 'payment received',
    'interest credited', 'dividend', 'bonus', 'incentive'
  ],
  
  'Savings': [
    'savings', 'deposit', 'fd', 'fixed deposit', 'recurring deposit',
    'mutual fund', 'sip', 'stock', 'zerodha', 'groww', 'upstox',
    'etmoney', 'paytm money', 'invest', 'equity', 'shares',
    'gold', 'digital gold'
  ],
  
  'Loans & EMIs': [
    'emi', 'loan', 'credit card', 'hdfc loan', 'icici loan',
    'sbi loan', 'home loan', 'car loan', 'personal loan',
    'bajaj finserv', 'repayment'
  ],
  
  'Transfers': [
    'transfer', 'upi', 'neft', 'imps', 'rtgs', 'bank transfer',
    'p2p', 'peer to peer'
  ],
  
  'Fees & Charges': [
    'bank charges', 'annual fee', 'late fee', 'penalty',
    'service charge', 'processing fee', 'gst', 'convenience fee'
  ],
  
  'Taxes': [
    'income tax', 'tds', 'advance tax', 'property tax',
    'professional tax', 'gst payment'
  ],
  
  'Donations': [
    'donation', 'charity', 'ngo', 'temple', 'church', 'mosque',
    'gurudwara', 'relief fund', 'pm cares', 'give india'
  ],
};

/**
 * Map a transaction to a category based on transactor name
 * @param transactorName - Name of the transactor
 * @param description - Optional transaction description
 * @returns Category name (defaults to 'Miscellaneous' if no match)
 */
export const mapTransactionToCategory = (
  transactorName: string,
  description?: string
): string => {
  // Combine transactor name and description for matching
  const textToMatch = (
    (transactorName || '') + 
    ' ' + 
    (description || '')
  ).toLowerCase();

  // Try to match against each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (textToMatch.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // Default to Miscellaneous if no match found
  return 'Miscellaneous';
};

/**
 * Get top N category suggestions with confidence scores
 * @param transactorName - Name of the transactor
 * @param description - Optional transaction description
 * @param topN - Number of top suggestions to return
 * @returns Array of tuples [categoryName, confidenceScore]
 */
export const getCategorySuggestions = (
  transactorName: string,
  description?: string,
  topN: number = 3
): Array<[string, number]> => {
  const textToMatch = (
    (transactorName || '') + 
    ' ' + 
    (description || '')
  ).toLowerCase();

  // Calculate match scores for each category
  const categoryScores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (textToMatch.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    if (matches > 0) {
      // Confidence score based on number of keyword matches
      const confidence = Math.min(matches * 0.3, 1.0); // Cap at 1.0
      categoryScores[category] = confidence;
    }
  }

  // Sort by confidence score and return top N
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return sortedCategories.length > 0 
    ? sortedCategories as Array<[string, number]>
    : [['Miscellaneous', 0.1]];
};

/**
 * Get all available category names
 */
export const getAllCategories = (): string[] => {
  return Object.keys(CATEGORY_RULES).concat(['Miscellaneous']);
};
