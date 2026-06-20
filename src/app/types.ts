export type Screen = 'login' | 'register' | 'home' | 'vehicle' | 'minor' | 'food' | 'declarations' | 'pet';
export type UserType = 'chilean' | 'foreign';
export type DeclarationType = 'vehicle' | 'minor' | 'food' | 'pet';
export type DeclarationStatus = 'valid' | 'pending' | 'error';

export interface User {
  id?: number;
  type: UserType;
  rut?: string;
  passport?: string;
  countryOfOrigin?: string;
  countryFlag?: string;
  name: string;
  email?: string;
  phone: string;
  hasChileanRut?: boolean;
  wantsPrintedQR: boolean;
  birthDate?: string;
}

export interface Declaration {
  id: string;
  type: DeclarationType;
  emoji: string;
  title: string;
  subtitle: string;
  date: string;
  status: DeclarationStatus;
  qrData: string;
}
