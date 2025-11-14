import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import type { User } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(authService.getAllUsers());
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
        <span className="text-gray-600 font-medium">{users.length} usuário(s)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="hidden md:table-header-group bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">E-mail</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data de Cadastro</th>
            </tr>
          </thead>
          <tbody className="bg-transparent md:bg-white md:divide-y md:divide-gray-200">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.email} className="block md:table-row mb-4 md:mb-0 bg-white rounded-lg shadow-md md:shadow-none md:hover:bg-gray-50 transition-colors">
                <td className="p-4 md:px-6 md:py-4 whitespace-nowrap block md:table-cell text-right md:text-left border-b md:border-b-0">
                    <span className="font-semibold text-gray-600 md:hidden float-left">E-mail</span>
                    <span className="text-sm font-medium text-gray-900">{user.email}</span>
                </td>
                <td className="p-4 md:px-6 md:py-4 whitespace-nowrap block md:table-cell text-right md:text-left">
                    <span className="font-semibold text-gray-600 md:hidden float-left">Data de Cadastro</span>
                    <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </td>
              </tr>
            )) : (
                <tr className="block md:table-row">
                    <td colSpan={2} className="text-center py-10 text-gray-500 block">
                        Nenhum usuário cadastrado ainda.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;