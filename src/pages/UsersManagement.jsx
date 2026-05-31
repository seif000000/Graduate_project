import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserMinus, Search, Filter, MoreVertical, Shield, Building, Heart } from 'lucide-react';
import { getAllUsers, deleteUser, getApiError } from '../api';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleFilter = filter === 'all' ? null : 
                        filter === 'المتبرعون' ? 'user' : 
                        filter === 'الصيدليات' ? 'pharmacy' : null;
      const res = await getAllUsers(roleFilter);
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل المستخدمين'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleDelete = async (userId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الحساب نهائياً؟")) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل حذف المستخدم'));
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch(role) {
      case 'user': return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase"><Shield size={12} /> متبرع</span>;
      case 'pharmacy': return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase"><Building size={12} /> صيدلية</span>;
      case 'admin': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase"><Shield size={12} /> أدمن</span>;
      default: return null;
    }
  };

  const getStatusBadge = (is_verified) => {
    return is_verified ? 
      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="موثق" /> :
      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="غير موثق" />;
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <Users className="text-primary-600" size={40} />
            إدارة المستخدمين
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">مراقبة الحسابات، توثيق الهويات، وإدارة الصلاحيات</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary h-12 px-6 shadow-primary-500/20">+ إضافة مستخدم</button>
        </div>
      </header>

      {/* Filters & Search */}
      <section className="glass-card p-6 flex flex-wrap items-center gap-6">
        <div className="flex-grow min-w-[300px] relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن مستخدم بالإسم أو البريد الإلكتروني..." 
            className="w-full bg-slate-50 border border-slate-200 h-12 pr-12 pl-4 rounded-xl font-bold text-slate-700 outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 bg-slate-50 border border-slate-200 px-6 rounded-xl font-bold text-slate-600 outline-none focus:border-primary-500"
          >
            <option value="all">الكل</option>
            <option value="المتبرعون">المتبرعون</option>
            <option value="الصيدليات">الصيدليات</option>
          </select>
        </div>
      </section>

      {/* Users Table */}
      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">المستخدم</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">الدور</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">تاريخ الانضمام</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">الحالة</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user, i) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-xs">
                        {user.full_name?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-none mb-1">{user.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-6 self-center">
                    <span className="text-xs font-bold text-slate-500">{new Date(user.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       {getStatusBadge(user.is_verified)}
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.is_verified ? 'verified' : 'pending'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all"><UserCheck size={16} /></button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <UserMinus size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination Mockup */}
      <div className="flex items-center justify-center gap-2">
         <button className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center">1</button>
         <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all font-bold flex items-center justify-center">2</button>
         <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all font-bold flex items-center justify-center">3</button>
      </div>
    </div>
  );
};

export default UsersManagement;
