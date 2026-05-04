import { useEffect, useState } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  MoreVertical,
  ChevronRight,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const statusConfig = {
  pending: { label: 'Novo', color: 'bg-blue-100 text-blue-600', icon: Clock },
  preparing: { label: 'Preparo', color: 'bg-yellow-100 text-yellow-600', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
  finished: { label: 'Finalizado', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-600', icon: CheckCircle2 },
};

export default function AdminOrders() {
  const { restaurant } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (!restaurant) return;

    const q = query(
      collection(db, 'restaurants', restaurant.id, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      
      // Notify logic would go here
      const lastChange = snapshot.docChanges()[0];
      if (lastChange?.type === 'added' && !snapshot.metadata.hasPendingWrites) {
        // Play notification sound
        console.log("New order received!");
      }
    });

    return unsubscribe;
  }, [restaurant]);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    if (!restaurant) return;
    await updateDoc(doc(db, 'restaurants', restaurant.id, 'orders', orderId), { status });
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 overflow-y-auto pb-8">
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
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12} />
                    {order.createdAt?.toDate ? format(order.createdAt.toDate(), "HH:mm '•' dd/MM", { locale: ptBR }) : 'Agora'}
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
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      {order.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.customer.name}</p>
                      <a href={`https://wa.me/${order.customer.phone}`} target="_blank" className="text-xs text-green-600 flex items-center gap-1 hover:underline">
                        <Phone size={10} /> {order.customer.phone}
                      </a>
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
                      <span className="text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-2">
                {order.status === 'pending' && (
                  <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600" onClick={() => updateStatus(order.id, 'preparing')}>
                    Aceitar Pedido
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => updateStatus(order.id, 'ready')}>
                    Pronto para Entrega
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button className="flex-1 bg-gray-900 hover:bg-black" onClick={() => updateStatus(order.id, 'finished')}>
                    Finalizar
                  </Button>
                )}
                {order.status !== 'finished' && order.status !== 'canceled' && (
                  <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => updateStatus(order.id, 'canceled')}>
                    Cancelar
                  </Button>
                )}
                {order.status === 'finished' && (
                  <div className="flex-1 text-center py-2 text-gray-400 font-medium text-sm">Pedido Concluído</div>
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
