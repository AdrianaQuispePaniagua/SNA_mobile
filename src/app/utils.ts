export const COUNTRIES = [
  "Argentina", "Bolivia", "Brasil", "Colombia", "Cuba", "Ecuador",
  "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay",
  "Perú", "República Dominicana", "Uruguay", "Venezuela",
  "Estados Unidos", "Canadá",
  "España", "Francia", "Alemania", "Italia", "Reino Unido", "Portugal",
  "Países Bajos", "Bélgica", "Suiza", "Suecia", "Noruega", "Dinamarca",
  "China", "Japón", "Corea del Sur", "India", "Taiwán", "Singapur",
  "Australia", "Nueva Zelanda",
  "Israel", "Turquía", "Rusia", "Sudáfrica", "Otro"
];

export const COUNTRY_FLAGS: Record<string, string> = {
  "Argentina": "🇦🇷", "Bolivia": "🇧🇴", "Brasil": "🇧🇷", "Colombia": "🇨🇴",
  "Cuba": "🇨🇺", "Ecuador": "🇪🇨", "México": "🇲🇽", "Paraguay": "🇵🇾",
  "Perú": "🇵🇪", "Uruguay": "🇺🇾", "Venezuela": "🇻🇪",
  "Estados Unidos": "🇺🇸", "Canadá": "🇨🇦",
  "España": "🇪🇸", "Francia": "🇫🇷", "Alemania": "🇩🇪", "Italia": "🇮🇹",
  "Reino Unido": "🇬🇧", "Portugal": "🇵🇹", "Países Bajos": "🇳🇱",
  "Bélgica": "🇧🇪", "Suiza": "🇨🇭", "Suecia": "🇸🇪", "Noruega": "🇳🇴",
  "China": "🇨🇳", "Japón": "🇯🇵", "Corea del Sur": "🇰🇷", "India": "🇮🇳",
  "Australia": "🇦🇺", "Nueva Zelanda": "🇳🇿", "Israel": "🇮🇱",
  "Turquía": "🇹🇷", "Rusia": "🇷🇺", "Sudáfrica": "🇿🇦"
};

export function validateRUT(rut: string): boolean {
  return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut.trim());
}

export function validatePassport(passport: string): boolean {
  return /^[A-Za-z0-9]{4,15}$/.test(passport.trim());
}

export function validateLicensePlate(plate: string): boolean {
  return /^[A-Za-z]{2}\d{2}[A-Za-z]{2}$/.test(plate.trim()) ||
    /^[A-Za-z]{4}\d{2}$/.test(plate.trim());
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const PROHIBITED_PRODUCTS = ['carne fresca', 'ave fresca', 'cerdo', 'pollo crudo', 'res cruda', 'cordero fresco'];

export function isProhibitedProduct(type: string, description: string): boolean {
  const lower = (type + ' ' + description).toLowerCase();
  return PROHIBITED_PRODUCTS.some(p => lower.includes(p)) ||
    (type === 'carnes' && description.toLowerCase().includes('fres'));
}
