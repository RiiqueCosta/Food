import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  Rocket, 
  Store, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="bg-white min-h-screen text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#EA1D2C] p-2 rounded-lg text-white">
              <Store size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter">FoodSaaS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
             <a href="#features" className="text-sm font-semibold hover:text-[#EA1D2C]">Funcionalidades</a>
             <a href="#pricing" className="text-sm font-semibold hover:text-[#EA1D2C]">Preços</a>
             <Link to="/login">
               <Button variant="ghost" className="font-bold">Login</Button>
             </Link>
             <Link to="/login">
               <Button className="font-bold px-6">Começar Grátis</Button>
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-[#EA1D2C]/10 text-[#EA1D2C] rounded-full text-sm font-bold mb-6">
              Lançamento Nacional 🚀
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
              O Cardápio Digital que <span className="text-[#EA1D2C]">Transforma</span> seu Delivery.
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
              Receba pedidos em tempo real via Painel e WhatsApp. Experiência de usuário nível iFood para seus clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 gap-2 text-lg">
                  Criar meu Cardápio Agora <ArrowRight size={20} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg">Ver Demo</Button>
            </div>
            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} className="w-12 h-12 rounded-full border-4 border-white" src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                ))}
               </div>
               <p className="text-sm font-bold text-gray-500">
                 <span className="text-[#EA1D2C]">+500</span> restaurantes já usam
               </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
               <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800" className="w-full" alt="Painel Admin" />
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-3xl shadow-xl flex items-center gap-3 animate-bounce">
                  <div className="bg-green-500 p-2 rounded-full text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Novo Pedido</p>
                    <p className="text-sm font-bold">Hamburguer Duplo • R$ 45,90</p>
                  </div>
               </div>
            </div>
            <div className="absolute -z-10 -top-20 -right-20 w-80 h-80 bg-[#EA1D2C]/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-20 -left-20 w-80 h-80 bg-red-400/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Tudo que você precisa para crescer</h2>
            <p className="text-gray-500 font-medium">Desenvolvemos as ferramentas mais modernas para automatizar suas vendas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Tempo Real', desc: 'Seus pedidos aparecem na tela no mesmo segundo que o cliente clica.', icon: Zap },
              { title: 'WhatsApp Automático', desc: 'O pedido chega formatado no seu Zap direto da sacola do cliente.', icon: Smartphone },
              { title: 'Dashboard Completo', desc: 'Métricas de vendas, ticket médio e produtos mais vendidos.', icon: TrendingUp },
              { title: 'Gestão de Categorias', desc: 'Organize seu cardápio com facilidade e arraste para reordenar.', icon: Layout },
              { title: 'Segurança Total', desc: 'Dados protegidos com infraestrutura de nível global.', icon: ShieldCheck },
              { title: 'Multi-Tenant', desc: 'Cada restaurante tem sua própria URL personalizada.', icon: Users },
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#EA1D2C] group-hover:text-white transition-colors mb-6">
                  <f.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight">Planos Simples e Transparentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
              <div>
                <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4">Plano Free</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold">R$ 0</span>
                  <span className="text-gray-400 font-bold">/mês</span>
                </div>
              </div>
              <ul className="space-y-4">
                {['Até 10 produtos', 'Pedidos via WhatsApp', 'Painel Admin Básico', 'QR Code Automático'].map(f => (
                   <li key={f} className="flex items-center gap-3 font-medium text-gray-600">
                     <CheckCircle2 size={18} className="text-green-500" /> {f}
                   </li>
                ))}
              </ul>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full h-14 rounded-2xl">Começar Grátis</Button>
              </Link>
            </div>

            <div className="bg-gray-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden space-y-8 text-white scale-105">
              <div className="absolute top-6 right-6 bg-[#EA1D2C] px-4 py-1 rounded-full text-[10px] font-black uppercase">Mais Popular</div>
              <div>
                <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-4">Plano Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold">R$ 49</span>
                  <span className="text-gray-400 font-bold">,90/mês</span>
                </div>
              </div>
              <ul className="space-y-4">
                {['Produtos Ilimitados', 'Pedidos Ilimitados', 'Painel Gerencial Pro', 'Configurações Avançadas', 'Suporte Prioritário'].map(f => (
                   <li key={f} className="flex items-center gap-3 font-medium text-gray-200">
                     <CheckCircle2 size={18} className="text-[#EA1D2C]" /> {f}
                   </li>
                ))}
              </ul>
              <Link to="/login" className="block">
                <Button className="w-full h-14 rounded-2xl bg-[#EA1D2C] hover:bg-red-700">Adquirir Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-[#EA1D2C] p-2 rounded-lg text-white">
              <Store size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tighter">FoodSaaS</span>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">
            A plataforma completa para impulsionar o faturamento do seu restaurante com tecnologia e design.
          </p>
          <div className="mt-12 text-xs text-gray-400">
            © 2026 FoodSaaS. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
