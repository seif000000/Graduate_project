import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Save, X, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../api';
import { useLang } from '../context/LanguageContext';

const EMPTY_FORM = {
  name: '',
  role: '',
  bio: '',
  photo_url: '',
  github: '',
  linkedin: '',
  email: '',
  order: 0,
};

function MemberForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const { t } = useLang();
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Name */}
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.nameLabel')}</label>
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('team.namePlaceholder')}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.roleLabel')}</label>
        <input
          required
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          placeholder={t('team.rolePlaceholder')}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Order */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.orderLabel')}</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => set('order', Number(e.target.value))}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Bio */}
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.bioLabel')}</label>
        <textarea
          rows={2}
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder={t('team.bioPlaceholder')}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
        />
      </div>

      {/* Photo URL */}
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
          <ImageIcon size={12} /> {t('team.photoLabel')}
        </label>
        <input
          value={form.photo_url}
          onChange={(e) => set('photo_url', e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 font-mono"
          dir="ltr"
        />
      </div>

      {/* Social */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.githubLabel')}</label>
        <input
          value={form.github}
          onChange={(e) => set('github', e.target.value)}
          placeholder="https://github.com/username"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 font-mono"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.linkedinLabel')}</label>
        <input
          value={form.linkedin}
          onChange={(e) => set('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 font-mono"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{t('team.emailLabel')}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="example@email.com"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 font-mono"
          dir="ltr"
        />
      </div>

      {/* Preview */}
      {form.photo_url && (
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          <img
            src={form.photo_url}
            alt="preview"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
            onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
          />
          <span className="text-xs text-slate-500">{t('team.imagePreview')}</span>
        </div>
      )}

      {/* Actions */}
      <div className="md:col-span-2 flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary px-5 py-2 text-sm">
          <X size={16} /> {t('team.cancel')}
        </button>
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {t('team.save')}
        </button>
      </div>
    </form>
  );
}

export default function TeamManagement() {
  const { t } = useLang();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    getTeamMembers()
      .then(({ data }) => setMembers(data))
      .catch(() => toast.error(t('team.loadFailed')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await createTeamMember(form);
      toast.success(t('team.addSuccess'));
      setShowAdd(false);
      refresh();
    } catch {
      toast.error(t('team.addFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, form) => {
    setSaving(true);
    try {
      await updateTeamMember(id, form);
      toast.success(t('team.updateSuccess'));
      setEditId(null);
      refresh();
    } catch {
      toast.error(t('team.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('team.confirmDelete').replace('{name}', name))) return;
    try {
      await deleteTeamMember(id);
      toast.success(t('team.deleteSuccess'));
      refresh();
    } catch {
      toast.error(t('team.deleteFailed'));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="text-emerald-400" size={32} />
            {t('team.title')}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {t('team.subtitle')}
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditId(null); }}
          className="btn-primary"
        >
          <Plus size={18} /> {t('team.addMember')}
        </button>
      </header>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-primary-100 shadow-lg p-6"
          >
            <h2 className="font-black text-slate-700 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-primary-500" /> {t('team.addMemberTitle')}
            </h2>
            <MemberForm
              onSave={handleCreate}
              onCancel={() => setShowAdd(false)}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-primary-400" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users size={56} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">{t('team.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('team.emptySubtitle')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((m) => (
            <motion.div
              key={m.id}
              layout
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-lg">
                      {m.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-black text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>

                {/* Order badge */}
                <span className="hidden sm:block text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-lg">
                  {t('team.orderBadge')} {m.order}
                </span>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditId(editId === m.id ? null : m.id)}
                    className="w-9 h-9 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 flex items-center justify-center transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              <AnimatePresence>
                {editId === m.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 px-5 py-4 bg-slate-50"
                  >
                    <MemberForm
                      initial={{ ...m, photo_url: m.photo_url || '', github: m.github || '', linkedin: m.linkedin || '', email: m.email || '', bio: m.bio || '' }}
                      onSave={(form) => handleUpdate(m.id, form)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
