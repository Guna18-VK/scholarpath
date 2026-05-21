import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      home: 'Home',
      scholarships: 'Scholarships',
      dashboard: 'Dashboard',
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      search: 'Search',
      apply: 'Apply Now',
      save: 'Save',
      eligible: 'Eligible',
      notEligible: 'Not Eligible',
      deadline: 'Deadline',
      amount: 'Amount',
      provider: 'Provider',
      category: 'Category',
      welcome: 'Welcome',
      findScholarships: 'Find Your Perfect Scholarship',
      heroSubtitle: 'Discover thousands of scholarships tailored to your profile. Never miss an opportunity again.',
      getStarted: 'Get Started',
      browseScholarships: 'Browse Scholarships',
    },
  },
  hi: {
    translation: {
      home: 'होम',
      scholarships: 'छात्रवृत्ति',
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      logout: 'लॉगआउट',
      search: 'खोजें',
      apply: 'अभी आवेदन करें',
      save: 'सहेजें',
      eligible: 'पात्र',
      notEligible: 'अपात्र',
      deadline: 'अंतिम तिथि',
      amount: 'राशि',
      provider: 'प्रदाता',
      category: 'श्रेणी',
      welcome: 'स्वागत है',
      findScholarships: 'अपनी सही छात्रवृत्ति खोजें',
      heroSubtitle: 'अपनी प्रोफ़ाइल के अनुसार हजारों छात्रवृत्तियाँ खोजें।',
      getStarted: 'शुरू करें',
      browseScholarships: 'छात्रवृत्ति देखें',
    },
  },
  ta: {
    translation: {
      home: 'முகப்பு',
      scholarships: 'உதவித்தொகை',
      dashboard: 'டாஷ்போர்டு',
      profile: 'சுயவிவரம்',
      login: 'உள்நுழைய',
      register: 'பதிவு செய்',
      logout: 'வெளியேறு',
      search: 'தேடு',
      apply: 'இப்போது விண்ணப்பிக்கவும்',
      save: 'சேமி',
      eligible: 'தகுதியானவர்',
      notEligible: 'தகுதியற்றவர்',
      deadline: 'கடைசி தேதி',
      amount: 'தொகை',
      provider: 'வழங்குநர்',
      category: 'வகை',
      welcome: 'வரவேற்கிறோம்',
      findScholarships: 'உங்கள் சரியான உதவித்தொகையை கண்டறியுங்கள்',
      heroSubtitle: 'உங்கள் சுயவிவரத்திற்கு ஏற்ற ஆயிரக்கணக்கான உதவித்தொகைகளை கண்டறியுங்கள்.',
      getStarted: 'தொடங்குங்கள்',
      browseScholarships: 'உதவித்தொகைகளை உலாவுங்கள்',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
