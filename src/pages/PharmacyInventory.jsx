import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Package, Search, Plus, Filter, MoreVertical, Trash2, Edit, ExternalLink, X } from 'lucide-react';
import { getPharmacyInventory, deletePharmacyInventory, addPharmacyInventory, updatePharmacyInventory, getApiError } from '../api';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const PharmacyInventory = () => {
  const { t } = useLang();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'near' | 'good'
  const emptyMedicine = {
    medicine_name: '',
    generic_name: '',
    quantity: '',
    expiry_date: '',
    batch_info: '',
    price: 'متوفر'
  };
  const [newMedicine, setNewMedicine] = useState(emptyMedicine);

  const openAddForm = () => {
    setEditingId(null);
    setNewMedicine(emptyMedicine);
    setShowAddForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setNewMedicine({
      medicine_name: item.medicine_name || '',
      generic_name: item.generic_name || '',
      quantity: item.quantity || '',
      expiry_date: item.expiry_date || '',
      batch_info: item.batch_info || '',
      price: item.price || 'متوفر',
    });
    setShowAddForm(true);
  };

  const fetchInventory = async () => {
    try {
      const response = await getPharmacyInventory();
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error(getApiError(error, t('inventory.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('inventory.confirmDelete'))) {
      try {
        await deletePharmacyInventory(id);
        toast.success(t('inventory.deleteSuccess'));
        fetchInventory();
      } catch (e) {
        toast.error(t('inventory.deleteError'));
      }
    }
  };

  const handleSubmitMedicine = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePharmacyInventory(editingId, newMedicine);
        toast.success(t('inventory.updateSuccess'));
      } else {
        await addPharmacyInventory(newMedicine);
        toast.success(t('inventory.addSuccess'));
      }
      setShowAddForm(false);
      setEditingId(null);
      setNewMedicine(emptyMedicine);
      fetchInventory();
    } catch (err) {
      toast.error(getApiError(err, editingId ? t('inventory.updateError') : t('inventory.addError')));
    }
  };

  const filteredInventory = inventory
    .filter(item =>
      filterStatus === 'all' ||
      (filterStatus === 'near' ? item.is_near_expiry : !item.is_near_expiry)
    )
    .filter(item =>
      (item.medicine_name || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.generic_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
             <Building2 className="text-primary-600" size={40} />
             {t('inventory.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-4">
            <button
              onClick={openAddForm}
              className="btn-primary h-14 px-8 shadow-primary-600/20 gap-3 bg-slate-900 border-slate-900"
            >
               <Plus size={20} />
               {t('inventory.addBtn')}
            </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl p-6 border border-white relative overflow-hidden">
            <div className="absolute start-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('inventory.totalItems')}</p>
            <h3 className="text-3xl font-black text-slate-800">{inventory.length}</h3>
         </div>
         <div className="bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl p-6 border border-white relative overflow-hidden">
            <div className="absolute start-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('inventory.availableNow')}</p>
            <h3 className="text-3xl font-black text-emerald-600">{inventory.filter(i => i.quantity !== '0').length}</h3>
         </div>
         <div className="bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl p-6 border border-white relative overflow-hidden">
            <div className="absolute start-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('inventory.shortages')}</p>
            <h3 className="text-3xl font-black text-amber-600">0</h3>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
         <div className="relative flex-grow max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-100 ps-12 pe-6 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-slate-700 text-sm"
            />
         </div>
         <div className="flex gap-3 items-center">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-12 px-6 rounded-2xl border border-slate-100 bg-white text-slate-600 font-bold text-xs outline-none focus:border-primary-500 transition-all cursor-pointer"
            >
               <option value="all">{t('inventory.filterAll')}</option>
               <option value="good">{t('inventory.filterGood')}</option>
               <option value="near">{t('inventory.filterNear')}</option>
            </select>
         </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgba(14,165,233,0.05)] rounded-3xl border border-white overflow-hidden">
         {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-bold">{t('inventory.loading')}</p>
            </div>
         ) : filteredInventory.length === 0 ? (
            <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl opacity-50">📦</div>
               <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-800">{t('inventory.emptyTitle')}</h4>
                  <p className="text-sm text-slate-400 font-bold">{t('inventory.emptySubtitle')}</p>
               </div>
               <button onClick={openAddForm} className="btn-primary h-12 px-8 inline-flex">{t('inventory.addFirst')}</button>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-start border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.colName')}</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.colGeneric')}</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.colQuantity')}</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.colExpiry')}</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.colStatus')}</th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('inventory.colActions')}</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">💊</div>
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
                                 {item.is_near_expiry ? t('inventory.statusNear') : t('inventory.statusGood')}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center justify-center gap-2">
                                 <button onClick={() => openEditForm(item)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center justify-center shadow-sm"><Edit size={16} /></button>
                                 <button 
                                   onClick={() => handleDelete(item.id)}
                                   className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center shadow-sm"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Add Form Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
           >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="text-start">
                    <h3 className="text-xl font-black text-slate-800">{editingId ? t('inventory.editTitle') : t('inventory.addTitle')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('inventory.formHint')}</p>
                 </div>
                 <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitMedicine} className="p-8 space-y-4 text-start">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelTradeName')}</label>
                       <input
                         required
                         type="text"
                         value={newMedicine.medicine_name}
                         onChange={(e) => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                         placeholder={t('inventory.phTradeName')}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelGeneric')}</label>
                       <input
                         type="text"
                         value={newMedicine.generic_name}
                         onChange={(e) => setNewMedicine({...newMedicine, generic_name: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                         placeholder="Paracetamol"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelQuantity')}</label>
                       <input
                         required
                         type="text"
                         value={newMedicine.quantity}
                         onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                         placeholder={t('inventory.phQuantity')}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelExpiry')}</label>
                       <input 
                         required
                         type="text" 
                         value={newMedicine.expiry_date}
                         onChange={(e) => setNewMedicine({...newMedicine, expiry_date: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                         placeholder="12/2025"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelPriceStatus')}</label>
                       <input
                         type="text"
                         value={newMedicine.price}
                         onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                       />
                    </div>
                    <div className="space-y-1 col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-2">{t('inventory.labelBatch')}</label>
                       <input
                         type="text"
                         value={newMedicine.batch_info}
                         onChange={(e) => setNewMedicine({...newMedicine, batch_info: e.target.value})}
                         className="w-full h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl outline-none focus:border-primary-500 font-bold"
                         placeholder={t('inventory.phBatch')}
                       />
                    </div>
                 </div>
                 <div className="pt-6">
                    <button type="submit" className="w-full h-14 bg-primary-600 text-white font-black rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all">{editingId ? t('inventory.saveEdits') : t('inventory.confirmAdd')}</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default PharmacyInventory;
