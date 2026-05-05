import { useRestaurant } from '../hooks/useRestaurant';
import { db } from '../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Smartphone, Monitor, Printer, Palette } from 'lucide-react';

export default function AdminSettings() {
  const { restaurant } = useRestaurant();
  const [formData, setFormData] = useState(restaurant || {});
  const [saving, setSaving] = useState(false);

  if (!restaurant) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), formData);
      alert('Configurações salvas!');
    } catch (e) {
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const menuUrl = `${window.location.origin}/r/${restaurant.slug}`;

  return (
    <div className="max-w-4xl space-y-10 pb-20">
      {/* Profile */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Smartphone size={24} className="text-[#EA1D2C]" />
          Perfil do Restaurante
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome Público</label>
            <Input 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Slug (URL)</label>
            <Input 
              value={formData.slug || ''} 
              disabled 
              className="bg-gray-50 opacity-50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">WhatsApp (Somente números)</label>
            <Input 
              value={formData.whatsapp || ''} 
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">URL da Logo</label>
            <Input 
              placeholder="https://..." 
              value={formData.logoUrl || ''} 
              onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} 
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </section>

      {/* QR Code */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
           <QRCodeSVG value={menuUrl} size={180} />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-bold">QR Code do Seu Cardápio</h3>
          <p className="text-gray-500 text-sm">Aponte a câmera do celular para testar seu cardápio em tempo real. Imprima este QR Code e coloque nas mesas.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.open(menuUrl, '_blank')}>
              <Monitor size={16} /> Ver Online
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              navigator.clipboard.writeText(menuUrl);
              alert('Copiado!');
            }}>
              <Share2 size={16} /> Copiar Link
            </Button>
          </div>
        </div>
      </section>

      {/* Printer Configuration */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Printer size={24} className="text-[#EA1D2C]" />
          Impressão & Operação
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-[#EA1D2C]" 
              checked={!!formData.config?.automaticPrinting}
              onChange={e => setFormData({ ...formData, config: { ...formData.config, automaticPrinting: e.target.checked } })}
            />
            <div>
               <p className="font-bold">Notificação Sonora</p>
               <p className="text-xs text-gray-500">Tocar um alerta toda vez que um novo pedido chegar.</p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}
