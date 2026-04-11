import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, Search, Plus, Filter, MoreVertical, Trash2, Edit, ExternalLink } from 'lucide-react';
import { getPharmacyInventory } from '../api';

const PharmacyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await getPharmacyInventory();
        setInventory(response.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
             <Building2 className="text-primary-600" size={40} />
             مخزون الصيدلية
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">إدارة الأدوية المتوفرة والعقاقير في متناول يدك</p>
        </div>
        <div className="flex gap-4">
           <button className="btn-primary h-14 px-8 shadow-primary-600/20 gap-3 bg-slate-900 border-slate-900">
              <Plus size={20} />
              إضافة دواء جديد
           </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-r-4 border-primary-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">إجمالي الأصناف</p>
            <h3 className="text-3xl font-black text-slate-800">{inventory.length}</h3>
         </div>
         <div className="glass-card p-6 border-r-4 border-emerald-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">متوفر حالياً</p>
            <h3 className="text-3xl font-black text-emerald-600">{inventory.filter(i => i.quantity !== '0').length}</h3>
         </div>
         <div className="glass-card p-6 border-r-4 border-amber-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">نواقص مطلوبة</p>
            <h3 className="text-3xl font-black text-amber-600">0</h3>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="relative flex-grow max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="ابحث في المخزون عن دواء محدد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-100 pr-12 pl-6 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-slate-700 text-sm"
            />
         </div>
         <div className="flex gap-3">
            <button className="h-12 px-6 rounded-2xl border border-slate-100 flex items-center gap-2 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all">
               <Filter size={16} />
               تصفية النتائج
            </button>
         </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden">
         {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-bold">جاري تحميل المخزون...</p>
            </div>
         ) : filteredInventory.length === 0 ? (
            <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl opacity-50">📦</div>
               <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-800">لا يوجد أدوية في المخزون</h4>
                  <p className="text-sm text-slate-400 font-bold">ابدأ بإضافة الأدوية المتوفرة في صيدليتك الآن.</p>
               </div>
               <button className="btn-primary h-12 px-8 inline-flex">إضافة أول دواء</button>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم الدواء</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">المادة الفعالة</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الانتهاء</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black">💊</div>
                                 <div>
                                    <p className="font-black text-slate-800">{item.medicine_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{item.batch_info || 'SN: 000-000'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6 font-bold text-slate-600 text-sm">{item.generic_name}</td>
                           <td className="p-6 font-black text-slate-800">{item.quantity}</td>
                           <td className="p-6 font-bold text-slate-500 text-sm">{item.expiry_date}</td>
                           <td className="p-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.is_near_expiry ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                 {item.is_near_expiry ? 'قريب الانتهاء' : 'حالة جيدة'}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center justify-center gap-2">
                                 <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center justify-center shadow-sm"><Edit size={16} /></button>
                                 <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center shadow-sm"><Trash2 size={16} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

export default PharmacyInventory;
