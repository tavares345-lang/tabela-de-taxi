import type { Fare } from '../types';

const FARES_KEY = 'taxi_app_fares';

const initialFares: Fare[] = [
  { id: '3', region: 'Zona Histórica', destination: 'Bairro Histórico', meterValue: 18.50, counterValue: 20.00 },
  { id: '4', region: 'Zona Leste', destination: 'Parque das Águas', meterValue: 32.00, counterValue: 35.00 },
  { id: '5', region: 'Zona Central', destination: 'Hotel Palace', meterValue: 45.00, counterValue: 50.00 },
];

export const getFares = (): Fare[] => {
  try {
    const storedFares = localStorage.getItem(FARES_KEY);
    if (storedFares) {
      return JSON.parse(storedFares);
    } else {
      localStorage.setItem(FARES_KEY, JSON.stringify(initialFares));
      return initialFares;
    }
  } catch (error) {
    console.error("Error getting fares from localStorage", error);
    return initialFares;
  }
};

export const storeFares = (fares: Fare[]) => {
  try {
    localStorage.setItem(FARES_KEY, JSON.stringify(fares));
  } catch (error) {
    console.error("Error storing fares to localStorage", error);
  }
};
