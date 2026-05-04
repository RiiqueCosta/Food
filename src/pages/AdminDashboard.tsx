import { useRestaurant } from '../hooks/useRestaurant';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const { restaurant, loading, createRestaurant } = useRestaurant();
  const [isCreating, setIsCreating] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', slug: '', whatsapp: '' });

  if (loading) return <div>Carregando dashboard...</div>;

  if (!restaurant) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-[#EA1D2C]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#EA1D2C]">
            <Plus size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Crie seu Restaurante</h2>
          <p className="text-gray-600 mb-8">Parece que você ainda não tem um restaurante cadastrado. Vamos começar!</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome do Restaurante</label>
              <Input 
                placeholder="Ex: Burger King" 
                value={newRestaurant.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                  setNewRestaurant({ ...newRestaurant, name, slug });
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL do Cardápio (Slug)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/r/</span>
                <Input 
                  placeholder="ex: burger-king" 
                  value={newRestaurant.slug}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, slug: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">WhatsApp de Recebimento</label>
              <Input 
                placeholder="Ex: 11999999999" 
                value={newRestaurant.whatsapp}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, whatsapp: e.target.value })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => createRestaurant(newRestaurant)}
              disabled={!newRestaurant.name || !newRestaurant.slug}
            >
              Criar Restaurante
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos Hoje', value: '0', color: 'bg-blue-500' },
          { label: 'Faturamento Hoje', value: 'R$ 0,00', color: 'bg-green-500' },
          { label: 'Ticket Médio', value: 'R$ 0,00', color: 'bg-purple-500' },
          { label: 'Produtos Ativos', value: '0', color: 'bg-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Pedidos Recentes</h3>
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="mx-auto mb-2 opacity-20" size={48} />
          <p>Nenhum pedido recebido hoje.</p>
        </div>
      </div>
    </div>
  );
}

import { ClipboardList } from 'lucide-react';
