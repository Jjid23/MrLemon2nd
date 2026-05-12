import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  Plus, 
  BarChart3, 
  History,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Inventory } from './Inventory';
import { OrdersList } from './OrdersList';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { cn } from '../../lib/utils';

interface AdminDashboardProps {
  permissions: string[];
}

export function AdminDashboard({ permissions }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'users' | 'roles'>('overview');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    bestSeller: 'None',
    topCashier: 'None'
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Real-time listener for orders to update stats
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const drinkCounts: Record<string, number> = {};
      const cashierSales: Record<string, number> = {};
      const dailyData: Record<string, number> = {};

      // Initialize last 7 days for chart
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyData[date] = 0;
      }

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total += data.total || 0;
        
        // Count drinks for best seller
        data.items?.forEach((item: any) => {
          drinkCounts[item.drinkName] = (drinkCounts[item.drinkName] || 0) + item.quantity;
        });

        // Track cashier performance
        if (data.cashierName) {
          cashierSales[data.cashierName] = (cashierSales[data.cashierName] || 0) + (data.total || 0);
        }

        // Chart data
        const date = format(data.createdAt?.toDate() || new Date(), 'MMM dd');
        if (dailyData[date] !== undefined) {
          dailyData[date] += data.total || 0;
        }
      });

      const best = Object.entries(drinkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
      const topStaff = Object.entries(cashierSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      setStats(prev => ({
        ...prev,
        totalSales: total,
        totalOrders: snapshot.size,
        bestSeller: best,
        topCashier: topStaff
      }));

      setChartData(Object.entries(dailyData).map(([name, value]) => ({ name, value })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-natural dark:bg-stone-950 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-stone-800 dark:text-stone-100 tracking-tight italic">MANAGEMENT</h1>
          <p className="text-stone-400 dark:text-stone-500 font-bold uppercase tracking-[0.3em] text-[11px] mt-2">Business overview and controls</p>
        </div>
        
        <div className="flex bg-stone-100/50 dark:bg-stone-900/50 p-2 rounded-[32px] border border-stone-200 dark:border-stone-800 shadow-inner">
          {permissions.includes('reports.view') && (
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-8 py-4 rounded-[24px] font-black text-xs transition-all uppercase tracking-[0.2em]",
                activeTab === 'overview' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xl" : "text-stone-400 hover:text-stone-800 dark:hover:text-stone-100"
              )}
            >
              Overview
            </button>
          )}
          {permissions.includes('inventory.manage') && (
            <button 
              onClick={() => setActiveTab('inventory')}
              className={cn(
                "px-8 py-4 rounded-[22px] font-black text-xs transition-all uppercase tracking-[0.2em]",
                activeTab === 'inventory' ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50" : "text-stone-400 hover:text-stone-800"
              )}
            >
              Inventory
            </button>
          )}
          {permissions.includes('orders.read') && (
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-8 py-4 rounded-[22px] font-black text-xs transition-all uppercase tracking-[0.2em]",
                activeTab === 'orders' ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50" : "text-stone-400 hover:text-stone-800"
              )}
            >
              Sales
            </button>
          )}
          {permissions.includes('users.manage') && (
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-8 py-4 rounded-[22px] font-black text-xs transition-all uppercase tracking-[0.2em]",
                activeTab === 'users' ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50" : "text-stone-400 hover:text-stone-800"
              )}
            >
              Staff
            </button>
          )}
          {permissions.includes('roles.manage') && (
            <button 
              onClick={() => setActiveTab('roles')}
              className={cn(
                "px-8 py-4 rounded-[22px] font-black text-xs transition-all uppercase tracking-[0.2em]",
                activeTab === 'roles' ? "bg-white text-stone-900 shadow-lg shadow-stone-200/50" : "text-stone-400 hover:text-stone-800"
              )}
            >
              Access
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
              <div className="w-14 h-14 bg-lemon rounded-2xl flex items-center justify-center text-white shadow-xl shadow-lemon/20">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 italic">₱{stats.totalSales.toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600">
                <ShoppingCart size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Orders</p>
                <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 italic">{stats.totalOrders}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                <Package size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Best Seller</p>
                <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 italic truncate">{stats.bestSeller}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                <Users size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Top Performer</p>
                <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 italic truncate">{stats.topCashier}</h3>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-10 rounded-[48px] border border-stone-100 dark:border-stone-800 shadow-sm h-[450px] transition-colors">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-3 italic">
                   <BarChart3 size={24} className="text-lemon" />
                   SALES OVERVIEW
                 </h3>
               </div>
               <ResponsiveContainer width="100%" height="80%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 700, fill: '#57534e' }}
                     dy={10}
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fontWeight: 700, fill: '#57534e' }}
                   />
                   <Tooltip 
                     cursor={{ fill: '#1c1917' }}
                     contentStyle={{ 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                        backgroundColor: '#1c1917',
                        color: '#f5f5f4'
                      }}
                   />
                   <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#F4D03F' : '#292524'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>

            <div className="bg-olive p-8 rounded-[40px] shadow-2xl text-white space-y-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black mb-2 tracking-tight">Business Stats</h3>
                <p className="text-stone-300 text-xs font-bold uppercase tracking-widest">Growth Indicators</p>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lemon">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Active Inventory</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Monitor tightly</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setActiveTab('inventory')}
                className="w-full py-4 bg-white text-stone-800 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Go to Inventory
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'orders' && <OrdersList />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'roles' && <RoleManagement />}
    </div>
  );
}
