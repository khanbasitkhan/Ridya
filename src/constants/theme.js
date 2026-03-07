export const COLORS = {
  
  primary: '#F15A24',      
  secondary: '#9E1F63',    
  accent: '#FF4D4D',      

  
  white: '#FFFFFF',
  background: '#F8F9FA',   
  textDark: '#1A1A1A',     
  textGrey: '#7D7D7D',     
  border: '#E0E0E0',
  

  success: '#28A745',
  error: '#DC3545',
  star: '#FFD700',         
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  
  h1: 30,
  h2: 22,
  h3: 16,
  body: 14,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.textDark },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.textDark },
  h3: { fontSize: SIZES.h3, fontWeight: '600', color: COLORS.textDark },
  body: { fontSize: SIZES.body, color: COLORS.textGrey },
};

const theme = { COLORS, SIZES, FONTS };
export default theme;