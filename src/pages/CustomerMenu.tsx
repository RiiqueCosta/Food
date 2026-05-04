import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Restaurant, Category, Product } from '../types';
import { useCart, CartProvider } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  X,
  Minus,
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function CustomerMenuWrapper() {
  return (
    <CartProvider>
      <CustomerMenu />
    </CartProvider>
  );
}

function CustomerMenu() {
  const { slug } = useParams();
  const { items, total, addItem, clearCart, removeItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', table: '', type: 'pickup' as 'pickup' | 'table' });
  const [orderSending, setOrderSending] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchRestaurant = async () => {
      const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const restData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Restaurant;
        setRestaurant(restData);

        const catQuery = query(collection(db, 'restaurants', restData.id, 'categories'), orderBy('order', 'asc'));
        const prodQuery = query(collection(db, 'restaurants', restData.id, 'products'));

        onSnapshot(catQuery, (s) => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() } as Category))));
        onSnapshot(prodQuery, (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))));
      }
      setLoading(false);
    };

    fetchRestaurant();
  }, [slug]);

  const handleCheckout = async () => {
    if (!restaurant || !customerInfo.name || !customerInfo.phone) return;
    setOrderSending(true);

    try {
      const orderData = {
        restaurantId: restaurant.id,
        customer: customerInfo,
        items,
        total,
        status: 'pending',
        type: customerInfo.type,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'restaurants', restaurant.id, 'orders'), orderData);
      
      // WhatsApp Message Formatting
      const itemsText = items.map(i => `${i.quantity}x ${i.name}${i.observations ? `\n(Obs: ${i.observations})` : ''}`).join('\n');
      const waMessage = `━━━━━━━━━━━━━━\n🧾 NOVO PEDIDO\n\n👤 Cliente: ${customerInfo.name}\n📱 WhatsApp: ${customerInfo.phone}\n${customerInfo.type === 'table' ? `🍽️ Mesa: ${customerInfo.table}\n` : '📦 Tipo: Retirada'}\n\n📦 ITENS:\n${itemsText}\n\n💰 Total: R$ ${total.toFixed(2)}\n━━━━━━━━━━━━━━`;
      
      const whatsappUrl = `https://api.whatsapp.com/send?phone=55${restaurant.whatsapp}&text=${encodeURIComponent(waMessage)}`;
      
      window.open(whatsappUrl, '_blank');
      clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      alert('Pedido realizado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar pedido.');
    } finally {
      setOrderSending(false);
    }
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin"></div>
     </div>
  );
  
  if (!restaurant) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante não encontrado</h1>
      <p className="text-gray-500">A URL pode estar incorreta.</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-48 bg-gray-200">
        <img 
          src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200'} 
          className="w-full h-full object-cover" 
          alt="Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg border-2 border-white overflow-hidden">
            <img 
               src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=200'} 
               className="w-full h-full object-cover rounded-xl" 
               alt="Logo" 
            />
          </div>
          <div className="mb-2 text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center gap-1 text-xs opacity-90">
                <Clock size={12} /> 25-35 min • <MapPin size={12} /> Aberto
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="mt-16 px-6 sticky top-0 bg-white/95 backdrop-blur z-30 pt-2 pb-4 border-b border-gray-100">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all",
                activeCategory === cat.id 
                  ? "bg-[#EA1D2C] text-white shadow-lg shadow-red-200" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar no cardápio" 
            className="pl-10 h-12 bg-gray-100 border-none rounded-2xl" 
          />
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 space-y-10">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.filter(p => p.categoryId === cat.id).map((prod) => (
                <div 
                  key={prod.id} 
                  className={cn(
                    "flex bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative",
                    !prod.available && "opacity-60 grayscale"
                  )}
                  onClick={() => prod.available && addItem(prod, 1)}
                >
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-gray-900 text-lg">{prod.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1 mb-3">{prod.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#EA1D2C] text-lg">R$ {prod.price.toFixed(2)}</span>
                      {prod.available ? (
                        <div className="bg-red-50 text-[#EA1D2C] p-1.5 rounded-full">
                           <Plus size={16} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold uppercase">Indisponível</span>
                      )}
                    </div>
                  </div>
                  <div className="w-32 h-32 bg-gray-100 shrink-0">
                    <img 
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200'} 
                      className="w-full h-full object-cover" 
                      alt={prod.name} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      {items.length > 0 && (
         <motion.div 
           initial={{ y: 100 }}
           animate={{ y: 0 }}
           className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-10 z-40"
         >
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full bg-[#EA1D2C] text-white flex items-center justify-between p-4 rounded-2xl shadow-xl shadow-red-200 active:scale-[0.98] transition-transform"
           >
             <div className="flex items-center gap-3">
               <div className="bg-white/20 p-2 rounded-xl relative">
                 <ShoppingBag size={20} />
                 <span className="absolute -top-2 -right-2 bg-white text-[#EA1D2C] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                   {items.length}
                 </span>
               </div>
               <span className="font-bold text-lg">Ver Sacola</span>
             </div>
             <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
           </button>
         </motion.div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 z-[50]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[60] rounded-t-[32px] max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h3 className="text-xl font-bold">Sua Sacola</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between font-bold">
                        <span>{item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#EA1D2C]"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => addItem({ id: item.productId, name: item.name, price: item.price } as any, 1)}
                          className="w-8 h-8 rounded-full bg-[#EA1D2C] flex items-center justify-center text-white"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 space-y-4 border-t border-gray-100">
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <Button size="lg" className="w-full h-16 rounded-2xl gap-2" onClick={() => setIsCheckoutOpen(true)}>
                  Escolher entrega <ArrowRight size={20} />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 z-[70]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[80] rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Finalizar Pedido</h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-100 p-1 rounded-2xl flex">
                  <button 
                    onClick={() => setCustomerInfo({ ...customerInfo, type: 'pickup' })}
                    className={cn("flex-1 py-3 text-sm font-bold rounded-xl transition-all", customerInfo.type === 'pickup' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
                  >
                    Retirada
                  </button>
                  <button 
                    onClick={() => setCustomerInfo({ ...customerInfo, type: 'table' })}
                    className={cn("flex-1 py-3 text-sm font-bold rounded-xl transition-all", customerInfo.type === 'table' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}
                  >
                    Mesa
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome Completo</label>
                    <Input 
                      placeholder="Como podemos te chamar?" 
                      className="h-14 rounded-2xl bg-gray-50"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">WhatsApp</label>
                    <Input 
                      placeholder="11 99999-9999" 
                      className="h-14 rounded-2xl bg-gray-50"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>
                  {customerInfo.type === 'table' && (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Número da Mesa</label>
                      <Input 
                        placeholder="Ex: 05" 
                        className="h-14 rounded-2xl bg-gray-50"
                        value={customerInfo.table}
                        onChange={e => setCustomerInfo({...customerInfo, table: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex gap-3 text-green-700">
                  <Info size={20} className="shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">Seu pedido será enviado via WhatsApp e também aparecerá no painel do restaurante em tempo real.</p>
                </div>

                <Button 
                   size="lg" 
                   className="w-full h-16 rounded-2xl" 
                   disabled={!customerInfo.name || !customerInfo.phone || (customerInfo.type === 'table' && !customerInfo.table) || orderSending}
                   onClick={handleCheckout}
                >
                  {orderSending ? 'Enviando...' : 'Finalizar pelo WhatsApp'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
