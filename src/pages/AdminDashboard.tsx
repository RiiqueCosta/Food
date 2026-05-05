import { useRestaurant } from '../hooks/useRestaurant';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Plus, ClipboardList, ChefHat, ExternalLink, Copy, Check } from 'lucide-react';

export default function AdminDashboard() {
  const { restaurant, loading, createRestaurant } = useRestaurant();
  const [isCreating, setIsCreating] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', slug: '', whatsapp: '' });
  const [copied, setCopied] = useState(false);

  const kitchenUrl = `${window.location.origin}/admin/kitchen`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(kitchenUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>Carregando dashboard...</div>;

  if (!restaurant) {
    // ... creating restaurant view ...
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

      {/* Kitchen View Access */}
      <div className="bg-gray-900 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative group">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-[#EA1D2C] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <ChefHat size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Painel da Cozinha</h3>
            <p className="text-gray-400 font-medium text-sm">Abra este link em um tablet ou PC na cozinha para ver os pedidos em tempo real.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto relative z-10">
          <div className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono truncate">
            {kitchenUrl}
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0"
            title="Copiar Link"
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
          </button>
          <a 
            href="/admin/kitchen" 
            target="_top"
            className="p-3 bg-[#EA1D2C] hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/20 shrink-0"
            title="Abrir Painel"
          >
            <ExternalLink size={20} />
          </a>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
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

