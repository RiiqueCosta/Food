import { useEffect, useState } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  MoreVertical,
  ChevronRight,
  Phone,
  Printer,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const statusConfig = {
  pending: { label: PortugueseOrderLabel('Novo'), color: 'bg-blue-100 text-blue-600', icon: Clock },
  preparing: { label: PortugueseOrderLabel('Preparo'), color: 'bg-yellow-100 text-yellow-600', icon: ChefHat },
  ready: { label: PortugueseOrderLabel('Pronto'), color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
  finished: { label: PortugueseOrderLabel('Finalizado'), color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
  canceled: { label: PortugueseOrderLabel('Cancelado'), color: 'bg-red-100 text-red-600', icon: CheckCircle2 },
};

function PortugueseOrderLabel(label: string) {
  return label;
}

export default function AdminOrders() {
  const { restaurant } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!restaurant) return;

    const q = query(
      collection(db, 'restaurants', restaurant.id, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      
      const lastChange = snapshot.docChanges()[0];
      if (lastChange?.type === 'added' && !snapshot.metadata.hasPendingWrites) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      }
    });

    return unsubscribe;
  }, [restaurant]);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    if (!restaurant) return;
    const path = `restaurants/${restaurant.id}/orders/${orderId}`;
    try {
      await updateDoc(doc(db, path), { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 100);
  };

  const notifyCustomer = (order: Order) => {
    const message = `Olá ${order.customer.name}! Seu pedido #${order.id.slice(-4).toUpperCase()} está pronto para ${order.type === 'table' ? 'servir na mesa' : 'retirada'}! 🎉`;
    const url = `https://api.whatsapp.com/send?phone=${order.customer.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* Printable Receipt Area */}
      {printingOrder && (
        <div id="printable-order" className="hidden print:block p-4 text-black font-mono">
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="font-bold text-xl">{restaurant?.name}</h2>
            <p className="text-xs uppercase">Comprovante de Pedido</p>
          </div>
          
          <div className="mb-2 text-sm">
            <p>PEDIDO: #{printingOrder.id.slice(-4).toUpperCase()}</p>
            <p>DATA: {printingOrder.createdAt?.toDate ? format(printingOrder.createdAt.toDate(), "dd/MM/yyyy HH:mm") : ''}</p>
            <p>CLIENTE: {printingOrder.customer.name}</p>
            <p>TIPO: {printingOrder.type === 'table' ? `MESA ${printingOrder.customer.table}` : 'RETIRADA'}</p>
          </div>

          <div className="border-b border-dashed border-black mb-2"></div>
          
          <div className="space-y-1 mb-2">
            {printingOrder.items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.observations && <p className="text-xs italic ml-4">* {item.observations}</p>}
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black mb-2"></div>
          
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>R$ {printingOrder.total.toFixed(2)}</span>
          </div>

          <div className="mt-8 text-center text-xs">
            <p>Obrigado pela preferência!</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciador de Pedidos</h2>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
          {(['all', 'pending', 'preparing', 'ready', 'finished'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === s ? 'bg-[#EA1D2C] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todos' : statusConfig[s as Order['status']].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 overflow-y-auto pb-8 no-print">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              layout
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow h-fit"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-900">#{order.id.slice(-4).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].label}
                    </span>
                    <button 
                      onClick={() => handlePrint(order)}
                      className="p-1.5 text-gray-400 hover:text-[#EA1D2C] hover:bg-red-50 rounded-lg transition-colors"
                      title="Imprimir Pedido"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12} />
                    {order.createdAt?.toDate ? format(order.createdAt.toDate(), PortugueseOrderLabel("HH:mm '•' dd/MM"), { locale: ptBR }) : 'Agora'}
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-bold text-lg text-[#EA1D2C]">R$ {order.total.toFixed(2)}</p>
                   <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{order.type === 'table' ? `Mesa ${order.customer.table}` : 'Retirada'}</p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {order.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.customer.name}</p>
                      <div className="flex items-center gap-2">
                        <a href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`} target="_blank" className="text-xs text-green-600 flex items-center gap-1 hover:underline font-bold">
                          <Phone size={10} /> {order.customer.phone}
                        </a>
                        <button 
                          onClick={() => notifyCustomer(order)}
                          className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-green-100"
                        >
                          <MessageCircle size={10} /> Notificar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-bold text-gray-400">{item.quantity}x</span>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.observations && <p className="text-xs text-gray-400 italic">"{item.observations}"</p>}
                        </div>
                      </div>
                      <span className="text-gray-500 font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-2">
                {order.status === 'pending' && (
                  <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 font-bold" onClick={() => updateStatus(order.id, 'preparing')}>
                    Aceitar Pedido
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 font-bold" onClick={() => updateStatus(order.id, 'ready')}>
                    Pronto para Entrega
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button className="flex-1 bg-gray-900 hover:bg-black font-bold" onClick={() => updateStatus(order.id, 'finished')}>
                    Finalizar
                  </Button>
                )}
                {order.status !== 'finished' && order.status !== 'canceled' && (
                  <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 font-bold" onClick={() => updateStatus(order.id, 'canceled')}>
                    Cancelar
                  </Button>
                )}
                {order.status === 'finished' && (
                  <div className="flex-1 text-center py-2 text-gray-400 font-black text-sm uppercase">Pedido Concluído</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
             <ClipboardList size={64} className="mx-auto text-gray-200 mb-4" />
             <h3 className="text-xl font-bold text-gray-400">Nenhum pedido encontrado</h3>
             <p className="text-gray-400 text-sm">Os pedidos aparecerão aqui quando chegarem.</p>
          </div>
        )}
      </div>
    </div>
  );
}
