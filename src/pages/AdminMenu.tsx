import { useState, useEffect } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { Category, Product } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminMenu() {
  const { restaurant } = useRestaurant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurant) return;

    const catQuery = query(
      collection(db, 'restaurants', restaurant.id, 'categories'),
      orderBy('order', 'asc')
    );
    const prodQuery = query(
      collection(db, 'restaurants', restaurant.id, 'products')
    );

    const unsubCats = onSnapshot(catQuery, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });

    const unsubProds = onSnapshot(prodQuery, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, [restaurant]);

  const handleAddCategory = async () => {
    if (!restaurant || !newCategoryName) return;
    await addDoc(collection(db, 'restaurants', restaurant.id, 'categories'), {
      name: newCategoryName,
      order: categories.length,
      restaurantId: restaurant.id
    });
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!restaurant) return;
    if (confirm('Tem certeza? Isso não apagará os produtos desta categoria.')) {
      await deleteDoc(doc(db, 'restaurants', restaurant.id, 'categories', id));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Cardápio</h2>
        <Button onClick={() => setIsAddingCategory(true)} className="gap-2">
          <Plus size={18} />
          Nova Categoria
        </Button>
      </div>

      <AnimatePresence>
        {isAddingCategory && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl border border border-gray-200 flex gap-4 items-end shadow-sm">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Nome da Categoria</label>
                <Input 
                  placeholder="Ex: Pizzas" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancelar</Button>
              <Button onClick={handleAddCategory}>Salvar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {categories.map((category) => (
          <CategorySection 
            key={category.id} 
            category={category} 
            products={products.filter(p => p.categoryId === category.id)}
            restaurantId={restaurant?.id || ''}
            onDelete={() => handleDeleteCategory(category.id)}
          />
        ))}

        {categories.length === 0 && !isAddingCategory && (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
            <UtensilsCrossed size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Comece criando sua primeira categoria!</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  key?: any;
  category: Category; 
  products: Product[]; 
  restaurantId: string;
  onDelete: () => Promise<void> | void;
}

function CategorySection({ 
  category, 
  products, 
  restaurantId,
  onDelete 
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await addDoc(collection(db, 'restaurants', restaurantId, 'products'), {
      ...newProduct,
      price: parseFloat(newProduct.price),
      categoryId: category.id,
      restaurantId,
      available: true
    });
    setNewProduct({ name: '', price: '', description: '' });
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'restaurants', restaurantId, 'products', id));
  };

  const toggleAvailability = async (product: Product) => {
    await updateDoc(doc(db, 'restaurants', restaurantId, 'products', product.id), {
      available: !product.available
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-gray-300" />
          <h3 className="font-bold text-gray-800">{category.name}</h3>
          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
            {products.length} itens
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 group">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <ImageIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                       {!product.available && (
                         <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Indisponível</span>
                       )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{product.description || 'Sem descrição'}</p>
                    <p className="font-bold text-[#EA1D2C]">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => toggleAvailability(product)}>
                      {product.available ? 'Pausar' : 'Ativar'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}

              {isAddingProduct ? (
                <div className="p-4 rounded-xl border border-dashed border-[#EA1D2C] bg-red-50/30 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input 
                    placeholder="Nome" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Preço (ex: 29.90)" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                  <Input 
                    placeholder="Descrição" 
                    className="md:col-span-2"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsAddingProduct(false)}>Cancelar</Button>
                    <Button className="flex-1" onClick={handleAddProduct}>Salvar</Button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 hover:border-[#EA1D2C] hover:text-[#EA1D2C] transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Adicionar Item</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { UtensilsCrossed } from 'lucide-react';
