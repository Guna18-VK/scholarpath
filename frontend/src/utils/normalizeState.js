/**
 * State Normalizer Utility
 * Converts any user-typed state variation to the correct official name.
 * e.g. "tamilnadu" → "Tamil Nadu", "TN" → "Tamil Nadu", "karnataka" → "Karnataka"
 */

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Lakshadweep',
  'Andaman and Nicobar Islands',
];

// Alias map — common misspellings, abbreviations, alternate names
const STATE_ALIASES = {
  // Tamil Nadu
  'tamilnadu': 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  'tamilnad': 'Tamil Nadu',
  'tn': 'Tamil Nadu',
  'tamilnādu': 'Tamil Nadu',

  // Andhra Pradesh
  'andhrapradesh': 'Andhra Pradesh',
  'andhra': 'Andhra Pradesh',
  'ap': 'Andhra Pradesh',

  // Arunachal Pradesh
  'arunachalpradesh': 'Arunachal Pradesh',
  'arunachal': 'Arunachal Pradesh',

  // Karnataka
  'karnataka': 'Karnataka',
  'karnatak': 'Karnataka',
  'ka': 'Karnataka',
  'bangalore state': 'Karnataka',

  // Kerala
  'kerala': 'Kerala',
  'kl': 'Kerala',
  'keralam': 'Kerala',

  // Maharashtra
  'maharashtra': 'Maharashtra',
  'mh': 'Maharashtra',
  'bombay state': 'Maharashtra',

  // Madhya Pradesh
  'madhyapradesh': 'Madhya Pradesh',
  'mp': 'Madhya Pradesh',
  'madhya': 'Madhya Pradesh',

  // Uttar Pradesh
  'uttarpradesh': 'Uttar Pradesh',
  'up': 'Uttar Pradesh',
  'uttar': 'Uttar Pradesh',

  // Uttarakhand
  'uttarakhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'uk': 'Uttarakhand',

  // West Bengal
  'westbengal': 'West Bengal',
  'west bengal': 'West Bengal',
  'wb': 'West Bengal',
  'bengal': 'West Bengal',

  // Rajasthan
  'rajasthan': 'Rajasthan',
  'rj': 'Rajasthan',
  'rajputana': 'Rajasthan',

  // Gujarat
  'gujarat': 'Gujarat',
  'gj': 'Gujarat',

  // Punjab
  'punjab': 'Punjab',
  'pb': 'Punjab',

  // Haryana
  'haryana': 'Haryana',
  'hr': 'Haryana',

  // Himachal Pradesh
  'himachalpradesh': 'Himachal Pradesh',
  'himachal': 'Himachal Pradesh',
  'hp': 'Himachal Pradesh',

  // Bihar
  'bihar': 'Bihar',
  'br': 'Bihar',

  // Jharkhand
  'jharkhand': 'Jharkhand',
  'jh': 'Jharkhand',

  // Odisha
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'od': 'Odisha',

  // Assam
  'assam': 'Assam',
  'as': 'Assam',

  // Chhattisgarh
  'chhattisgarh': 'Chhattisgarh',
  'chattisgarh': 'Chhattisgarh',
  'cg': 'Chhattisgarh',

  // Telangana
  'telangana': 'Telangana',
  'ts': 'Telangana',
  'tg': 'Telangana',

  // Goa
  'goa': 'Goa',
  'ga': 'Goa',

  // Manipur
  'manipur': 'Manipur',
  'mn': 'Manipur',

  // Meghalaya
  'meghalaya': 'Meghalaya',
  'ml': 'Meghalaya',

  // Mizoram
  'mizoram': 'Mizoram',
  'mz': 'Mizoram',

  // Nagaland
  'nagaland': 'Nagaland',
  'nl': 'Nagaland',

  // Sikkim
  'sikkim': 'Sikkim',
  'sk': 'Sikkim',

  // Tripura
  'tripura': 'Tripura',
  'tr': 'Tripura',

  // Delhi
  'delhi': 'Delhi',
  'dl': 'Delhi',
  'new delhi': 'Delhi',
  'ncr': 'Delhi',

  // Jammu & Kashmir
  'jammuandkashmir': 'Jammu & Kashmir',
  'jammu and kashmir': 'Jammu & Kashmir',
  'jammu kashmir': 'Jammu & Kashmir',
  'jk': 'Jammu & Kashmir',
  'j&k': 'Jammu & Kashmir',
  'kashmir': 'Jammu & Kashmir',

  // Ladakh
  'ladakh': 'Ladakh',
  'la': 'Ladakh',

  // Puducherry
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
  'pondy': 'Puducherry',
  'py': 'Puducherry',

  // Chandigarh
  'chandigarh': 'Chandigarh',
  'ch': 'Chandigarh',
};

/**
 * Normalize a state string to its official name.
 * Returns the matched official name or the original string if no match found.
 */
export const normalizeState = (input) => {
  if (!input) return '';
  const key = input.toLowerCase().trim().replace(/\s+/g, ' ');
  if (STATE_ALIASES[key]) return STATE_ALIASES[key];

  // Try direct case-insensitive match against official list
  const direct = INDIAN_STATES.find(
    (s) => s.toLowerCase() === key
  );
  if (direct) return direct;

  // Fuzzy: check if input is contained in any state name
  const fuzzy = INDIAN_STATES.find(
    (s) => s.toLowerCase().replace(/\s+/g, '').includes(key.replace(/\s+/g, ''))
  );
  if (fuzzy) return fuzzy;

  return input; // return as-is if no match
};

/**
 * Filter states list based on search query — used for autocomplete dropdown
 */
export const filterStates = (query) => {
  if (!query) return INDIAN_STATES;
  const q = query.toLowerCase().trim();
  return INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(q) ||
    s.toLowerCase().replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
    STATE_ALIASES[q] === s
  );
};
