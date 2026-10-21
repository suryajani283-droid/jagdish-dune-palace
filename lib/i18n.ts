export type Lang = 'en' | 'hi';

export const translations = {
  en: {
    hotelName: 'Jagdish Dune Palace', tagline: 'Luxury Desert Heritage · Chohtan, Barmer',
    bookStay: 'Book Your Stay', rooms: 'Rooms', home: 'Home', bookNow: 'Book Now',
  },
  hi: {
    hotelName: 'जगदीश ड्यून पैलेस', tagline: 'विलासिता रेगिस्तानी विरासत · चौहटन, बाड़मेर',
    bookStay: 'अपना ठहराव बुक करें', rooms: 'कमरे', home: 'होम', bookNow: 'अभी बुक करें',
  },
} as const;

export const t = (lang: Lang, key: keyof typeof translations.en) => translations[lang][key];