import { useState, useEffect } from 'react';
import { Users, UserCheck, UserMinus, Search, Filter, MoreVertical, Shield, Building, Trash2 } from 'lucide-react';
import { getAllUsers, getAdminStats, deleteUser, adminVerifyUser, getApiError } from '../api';
import toast from 'react-hot-toast';

const UsersManagement = () => {
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const roleParam = role === 'all' ? null :
                        role === 'المتبرعون' ? 'user' :
                        role === 'الصيدليات' ? 'pharmacy' : null;
      const res = await getAllUsers(roleParam);
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.users)
          ? payload.users
          : null;

      if (list) {
        setUsers(list);
      } else {
        console.error('Expected an array but got:', payload);
        setUsers([]);
        const looksLikeHtml = typeof payload === 'string' && payload.includes('<!DOCTYPE');
        toast.error(
          looksLikeHtml
            ? 'الخادم غير متصل — تأكد أن الباك إند يعمل (python -m app.main)'
            : 'فشل في استلام البيانات الصحيحة من الخادم'
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(getApiError(e, 'فشل تحميل المستخدمين'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filter);
  }, [filter]);

  useEffect(() => {
    getAdminStats()
      .then((res) => setPlatformStats(res.data))
      .catch((e) => console.error('Failed to load admin stats:', e));
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (e) {
      toast.error(getApiError(e, 'فشل حذف المستخدم'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = async (userId, currentStatus) => {
    try {
      await adminVerifyUser(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !currentStatus } : u));
      toast.success(!currentStatus ? 'تم توثيق المستخدم ✅' : 'تم إلغاء التوثيق');
    } catch (e) {
      toast.error(getApiError(e, 'فشل تحديث حالة التوثيق'));
    }
  };

  const filteredUsers = (users || []).filter(u =>
    (u.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch(role) {
      case 'user': return (
        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
          <Shield size={11} /> متبرع
        </span>
      );
      case 'pharmacy': return (
        <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
          <Building size={11} /> صيدلية
        </span>
      );
      case 'admin': return (
        <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
          <Shield size={11} /> أدمن
        </span>
      );
      default: return null;
    }
  };

  const stats = [
    { label: 'إجمالي المستخدمين', value: platformStats?.total_users ?? users.length, color: 'text-white' },
    { label: 'مستخدمون عاديون', value: platformStats?.total_donors ?? users.filter(u => u.role === 'user').length, color: 'text-emerald-400' },
    { label: 'صيدليات', value: platformStats?.total_pharmacies ?? users.filter(u => u.role === 'pharmacy').length, color: 'text-blue-400' },
    { label: 'موثّقون', value: users.filter(u => u.is_verified).length, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1 text-right">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="text-red-400" size={34} />
            إدارة المستخدمين
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            مراقبة الحسابات، توثيق الهويات، وإدارة الصلاحيات
          </p>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-800/60 border border-white/5 rounded-2xl p-5 text-right">
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-wrap items-center gap-4">
        <div className="flex-grow min-w-[260px] relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم المستخدم أو البريد الإلكتروني..."
            className="w-full bg-slate-800 border border-white/5 h-11 pr-12 pl-4 rounded-xl font-bold text-slate-200 outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 bg-slate-800 border border-white/5 px-4 rounded-xl font-bold text-slate-300 outline-none focus:border-red-500/50 text-sm"
          >
            <option value="all">الكل</option>
            <option value="المتبرعون">المتبرعون</option>
            <option value="الصيدليات">الصيدليات</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">المستخدم</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">الدور</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">تاريخ الانضمام</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-bold">جاري تحميل المستخدمين...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="text-4xl mb-3">👤</div>
                    <p className="text-slate-400 font-bold">لا يوجد مستخدمون مطابقون للبحث</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/3 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                          {user.full_name?.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-black text-white text-sm leading-none mb-1">{user.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${user.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {user.is_verified ? 'موثّق' : 'معلّق'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(user.id, user.is_verified)}
                          className={`p-2 rounded-lg transition-all ${
                            user.is_verified
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400'
                              : 'bg-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={user.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
                        >
                          <UserCheck size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <UserMinus size={15} />
                          )}
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-slate-200 transition-all" title="المزيد">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold">
              يُعرض <span className="text-slate-300">{filteredUsers.length}</span> من أصل <span className="text-slate-300">{users.length}</span> مستخدم
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-black text-xs flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-white/10 transition-all">2</button>
              <button className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 font-bold text-xs flex items-center justify-center hover:bg-white/10 transition-all">3</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
