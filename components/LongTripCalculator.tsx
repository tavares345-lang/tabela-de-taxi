import React, { useState, useCallback } from 'react';
import { getDistance } from '../services/geminiService';
import { CarIcon } from './icons/CarIcon';
import { MapPinIcon } from './icons/MapPinIcon';

interface LongTripCalculatorProps {
  isAdmin: boolean;
  pricePerKm: number;
  setPricePerKm: (price: number) => void;
}

const LongTripCalculator: React.FC<LongTripCalculatorProps> = ({ isAdmin, pricePerKm, setPricePerKm }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<{ distance: number; fare: number; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    if (!origin || !destination) {
      setError('Por favor, preencha os campos de origem e destino.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    const distance = await getDistance(origin, destination);

    if (distance) {
      const totalFare = distance * pricePerKm;
      setResult({
        distance: distance,
        fare: totalFare,
      });
    } else {
      setError('Não foi possível calcular a distância. Verifique os locais e tente novamente.');
    }
    setIsLoading(false);
  }, [origin, destination, pricePerKm]);

  const handleClear = () => {
    setOrigin('');
    setDestination('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <CarIcon className="w-12 h-12 mx-auto text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800 mt-2">Calculadora de Viagens Longas</h2>
        <p className="text-gray-600 mt-1">Estime o valor da sua viagem com base na distância.</p>
      </div>
      
      {isAdmin && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <label htmlFor="pricePerKm" className="block text-sm font-medium text-gray-700 mb-2">
            Valor por KM (Admin)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>
            <input
              type="number"
              id="pricePerKm"
              value={pricePerKm}
              onChange={(e) => setPricePerKm(parseFloat(e.target.value) || 0)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              step="0.01"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Local de Saída (ex: São Paulo, SP)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>
        <div className="relative">
          <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destino Final (ex: Rio de Janeiro, RJ)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-full hover:bg-yellow-600 transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculando...
            </>
          ) : (
            'Calcular Valor'
          )}
        </button>
        <button
            onClick={handleClear}
            disabled={isLoading}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-full hover:bg-gray-300 transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Limpar
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-700">Resultado da Simulação</h3>

          <p className="mt-4 text-sm text-gray-600">
            Distância aproximada: <span className="font-bold text-gray-800">{result.distance.toFixed(2)} km</span>
          </p>

          <div className="mt-4">
            <p className="text-gray-600">Valor Total Estimado da Corrida</p>
            <p className="text-4xl font-bold text-yellow-600">
              R$ {result.fare.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            *Este é um valor aproximado e pode variar.
          </p>
        </div>
      )}
    </div>
  );
};

export default LongTripCalculator;