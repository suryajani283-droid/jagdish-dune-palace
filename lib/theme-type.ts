export type Theme = {
  id?: string;
  name: string;
  display_name?: string;
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  text_color: string;
  navbar_bg: string | null;
  footer_bg: string | null;
};

export const fallbackTheme: Theme = {
  name: 'default',
  display_name: 'Default Desert',
  primary_color: '#17324D', // Navy
  secondary_color: '#C99A3B', // Gold
  bg_color: '#FFFFFF', // White
  text_color: '#24315D', // Dark Blue
  navbar_bg: '#F4EFE6', // Sandstone
  footer_bg: '#2C1E16', // Dark Brown
};