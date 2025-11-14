
import React, { useState, useRef } from 'react';
import type { Fare } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface FareTableProps {
  fares: Fare[];
  isAdmin: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddFare: (fare: Fare) => void;
  onUpdateFare: (fare: Fare) => void;
  onDeleteFare: (id: string) => void;
  onImportFares: (fares: Fare[]) => void;
}

const FareModal: React.FC<{
  fare: Fare | null;
  onSave: (fare: Fare) => void;
  onClose: () => void;
}> = ({ fare, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Fare, 'id'>>({
    region: fare?.region || '',
    destination: fare?.destination || '',
    meterValue: fare?.meterValue || 0,
    counterValue: fare?.counterValue || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: fare?.id || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{fare ? 'Editar Corrida' : 'Adicionar Nova Corrida'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Destino" className="w-full p-2 border rounded" required />
            <input type="text" name="region" value={formData.region} onChange={handleChange} placeholder="Região" className="w-full p-2 border rounded" required />
            <input type="number" name="meterValue" value={formData.meterValue} onChange={handleChange} placeholder="Valor Taxímetro" className="w-full p-2 border rounded" step="0.01" required />
            <input type="number" name="counterValue" value={formData.counterValue} onChange={handleChange} placeholder="Valor Balcão" className="w-full p-2 border rounded" step="0.01" required />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const FareTable: React.FC<FareTableProps> = ({ fares, isAdmin, searchTerm, setSearchTerm, onAddFare, onUpdateFare, onDeleteFare, onImportFares }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFare, setEditingFare] = useState<Fare | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!isAdmin) return;
        setEditingFare(null);
        setIsModalOpen(true);
    };

    const handleEdit = (fare: Fare) => {
        if (!isAdmin) return;
        setEditingFare(fare);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!isAdmin) return;
        if (window.confirm('Tem certeza que deseja excluir esta corrida?')) {
            onDeleteFare(id);
        }
    };

    const handleSave = (fare: Fare) => {
        if (!isAdmin) return;
        if (editingFare) {
            onUpdateFare(fare);
        } else {
            onAddFare(fare);
        }
        setIsModalOpen(false);
        setEditingFare(null);
    };

    const handleImportClick = () => {
        if (!isAdmin) return;
        fileInputRef.current?.click();
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Destino,Regiao,ValorTaximetro,ValorBalcao\n"
            + "Exemplo Destino A,Zona Sul,35.50,40.00\n"
            + "Exemplo Destino B,Zona Norte,22.00,25.00\n";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_importacao.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        if (!isAdmin) return;
        if (fares.length === 0) {
            alert("Não há dados na tabela para exportar.");
            return;
        }

        const header = "Destino,Regiao,ValorTaximetro,ValorBalcao\n";
        const csvRows = fares.map(fare => {
            // Ensure values with commas or quotes are wrapped in quotes
            const destination = `"${fare.destination.replace(/"/g, '""')}"`;
            const region = `"${fare.region.replace(/"/g, '""')}"`;
            // Use dot for decimal separator for consistency with import function
            const meterValue = fare.meterValue.toFixed(2);
            const counterValue = fare.counterValue.toFixed(2);
            return [destination, region, meterValue, counterValue].join(',');
        }).join('\n');
        
        // Add BOM for better Excel compatibility with special characters
        const csvContent = "\uFEFF" + header + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute("download", `export_tabela_taxi_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return;
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                const newFares: Fare[] = lines.slice(1) // Skip header row
                    .map((line, index) => {
                        const [destination, region, meterValueStr, counterValueStr] = line.split(',');
                        if (!region || !destination || !meterValueStr || !counterValueStr) return null;
                        
                        const meterValue = parseFloat(meterValueStr.trim());
                        const counterValue = parseFloat(counterValueStr.trim());

                        if (isNaN(meterValue) || isNaN(counterValue)) return null;
                        
                        return {
                            id: `imported-${new Date().getTime()}-${index}`,
                            region: region.trim(),
                            destination: destination.trim(),
                            meterValue,
                            counterValue,
                        };
                    }).filter((fare): fare is Fare => fare !== null);

                if (newFares.length > 0) {
                    onImportFares(newFares);
                    setSearchTerm(''); // Clear search term to show new data
                    alert(`${newFares.length} corridas importadas com sucesso! A tabela foi atualizada.`);
                } else {
                    alert('Nenhuma corrida válida encontrada no arquivo. Verifique o formato.');
                }
            } catch (error) {
                console.error("Erro ao processar o arquivo CSV:", error);
                alert('Ocorreu um erro ao processar o arquivo. Verifique se ele está no formato CSV correto (Destino,Regiao,ValorTaximetro,ValorBalcao).');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input to allow re-uploading the same file
    };

  return (
    <div className="bg-transparent">
       {isModalOpen && <FareModal fare={editingFare} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 shrink-0">Tabela de Preços</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
            <input
                type="text"
                placeholder="Buscar por região ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
            {isAdmin && (
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv"
                    />
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center justify-center bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 shadow-md"
                        title="Baixar modelo CSV para importação"
                    >
                        <DownloadIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Modelo</span>
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="flex items-center justify-center bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300 shadow-md"
                        title="Importar de arquivo CSV. Formato: Destino,Regiao,Taxímetro,Balcão"
                    >
                        <UploadIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Importar</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center bg-gray-500 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition-colors duration-300 shadow-md"
                        title="Exportar dados atuais para arquivo CSV"
                    >
                        <DownloadIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Exportar</span>
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition-colors duration-300 shadow-md"
                    >
                        <PlusIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Adicionar</span>
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <div className="mt-6 md:bg-white md:rounded-lg md:shadow overflow-hidden">
        <table className="min-w-full">
            <thead className="hidden md:table-header-group bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Região</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Taxímetro</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Balcão</th>
                    {isAdmin && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>}
                </tr>
            </thead>
            <tbody className="bg-transparent md:bg-white md:divide-y md:divide-gray-200">
                {fares.length > 0 ? fares.map((fare) => (
                    <tr key={fare.id} className="block md:table-row mb-4 md:mb-0 bg-white rounded-lg shadow-md md:shadow-none md:hover:bg-gray-50">
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b md:border-b-0">
                            <span className="font-semibold text-gray-600 md:hidden float-left">Destino</span>
                            <span className="text-sm font-medium text-gray-900">{fare.destination}</span>
                        </td>
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b md:border-b-0">
                            <span className="font-semibold text-gray-600 md:hidden float-left">Região</span>
                            <span className="text-sm text-gray-500">{fare.region}</span>
                        </td>
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b md:border-b-0">
                             <span className="font-semibold text-gray-600 md:hidden float-left">Valor Taxímetro</span>
                            <span className="text-sm text-gray-500">R$ {fare.meterValue.toFixed(2).replace('.', ',')}</span>
                        </td>
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell text-right md:text-left border-b md:border-b-0">
                            <span className="font-semibold text-gray-600 md:hidden float-left">Valor Balcão</span>
                             <span className="text-sm text-gray-900 font-bold">R$ {fare.counterValue.toFixed(2).replace('.', ',')}</span>
                        </td>
                        {isAdmin && (
                            <td className="p-4 md:px-6 md:py-4 block md:table-cell text-right">
                                <span className="font-semibold text-gray-600 md:hidden float-left">Ações</span>
                                <div className="flex items-center justify-end space-x-4">
                                    <button onClick={() => handleEdit(fare)} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(fare.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                )) : (
                    <tr className="block md:table-row">
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center text-sm text-gray-500 block">
                            <p className="text-xl font-semibold">Nenhum resultado encontrado.</p>
                            <p className="mt-2">Tente ajustar os termos da sua busca.</p>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default FareTable;
