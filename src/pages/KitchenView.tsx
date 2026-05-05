import { useEffect, useState } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Order } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, ChefHat, CheckCircle2, Printer, MessageCircle, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function KitchenView() {
  const { restaurant } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!restaurant) return;

    // Show only pending, preparing and ready orders
    const q = query(
      collection(db, 'restaurants', restaurant.id, 'orders'),
      where('status', 'in', PortugalStatusList()),
      orderBy('createdAt', 'asc')
    );

    function PortugalStatusList() {
      return ['pending', 'preparing', 'ready'];
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      
      // Notification sound logic
      const added = snapshot.docChanges().some(c => c.type === 'added');
      if (added && !snapshot.metadata.hasPendingWrites) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio blocked', e));
      }
    });

    return unsubscribe;
  }, [restaurant]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    if (!restaurant) return;
    await updateDoc(doc(db, 'restaurants', restaurant.id, 'orders', orderId), { status });
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
  };

  const notifyCustomer = (order: Order) => {
    const message = `Olá ${order.customer.name}! Seu pedido #${order.id.slice(-4).toUpperCase()} está pronto! 🎉`;
    const url = `https://api.whatsapp.com/send?phone=${order.customer.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 overflow-hidden flex flex-col relative w-full h-full fixed inset-0">
      {/* Printable Receipt Area */}
      {printingOrder && (
        <div id="printable-order" className="hidden print:block p-4 text-black font-mono bg-white">
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="font-bold text-xl">{restaurant.name}</h2>
            <p className="text-xs uppercase font-bold text-black border-black border-2 px-2 inline-block">Cozinha - Comprovante</p>
          </div>
          
          <div className="mb-2 text-sm">
            <p className="font-bold">ORDEM: #{printingOrder.id.slice(-4).toUpperCase()}</p>
            <p>DATA: {printingOrder.createdAt?.toDate ? format(printingOrder.createdAt.toDate(), "dd/MM/yyyy HH:mm") : ''}</p>
            <p>CLIENTE: {printingOrder.customer.name}</p>
            <p className="font-bold uppercase border-black border px-1 inline-block">LOCAL: {printingOrder.type === 'table' ? `MESA ${printingOrder.customer.table}` : 'RETIRADA'}</p>
          </div>

          <div className="border-b border-dashed border-black mb-2"></div>
          
          <div className="space-y-2 mb-2">
            {printingOrder.items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-bold">{item.quantity}x {item.name}</p>
                {item.observations && <p className="text-xs italic ml-4 font-bold opacity-75">{"\u00bb\u00bb"} {item.observations}</p>}
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black mt-4"></div>
        </div>
      )}

      <header className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6 shrink-0 no-print px-2">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#EA1D2C] rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <ChefHat size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">Cozinha Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700 hidden sm:block">
            <p className="text-2xl font-black font-mono">
              {orders.length}
              <span className="text-xs text-gray-400 font-bold ml-2 uppercase">Pedidos</span>
            </p>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 shadow-lg group"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? (
              <Minimize size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />
            ) : (
              <Maximize size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start overflow-y-auto no-print">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              layout
              key={order.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`rounded-3xl border-4 flex flex-col overflow-hidden h-fit ${
                order.status === 'pending' ? 'bg-blue-600/10 border-blue-600' : 
                order.status === 'ready' ? 'bg-green-600/10 border-green-600' : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className={`p-4 flex justify-between items-center ${
                order.status === 'pending' ? 'bg-blue-600' : 
                order.status === 'ready' ? 'bg-green-600' : 'bg-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-black text-xl">#{order.id.slice(-4).toUpperCase()}</span>
                  <button 
                    onClick={() => handlePrint(order)}
                    className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg transition-colors"
                  >
                    <Printer size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-2 py-1 rounded-full">
                  <Clock size={12} />
                  {order.createdAt?.toDate ? format(order.createdAt.toDate(), "HH:mm") : '--:--'}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-bold">{order.customer.name}</p>
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
                       {order.type === 'table' ? `Mesa: ${order.customer.table}` : 'Retirada'}
                    </p>
                  </div>
                  <button 
                    onClick={() => notifyCustomer(order)}
                    className="p-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg"
                    title="Notificar Cliente"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="bg-white text-black w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0">
                        {item.quantity}
                      </span>
                      <div>
                        <p className="text-lg font-bold leading-tight">{item.name}</p>
                        {item.observations && (
                           <p className="text-sm text-yellow-500 font-bold mt-1 uppercase">★ {item.observations}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6 mt-auto">
                {order.status === 'pending' && <p className="text-center font-black text-blue-500 uppercase animate-pulse shrink-0">Novo Pedido!</p>}
                {order.status === 'preparing' && <p className="text-center font-black text-gray-500 uppercase shrink-0">Em Preparo...</p>}
                {order.status === 'ready' && (
                  <div className="flex items-center justify-center gap-2 text-green-500 font-black uppercase shrink-0">
                    <CheckCircle2 size={16} /> Pronto!
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
