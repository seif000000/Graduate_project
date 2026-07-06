import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Upload, Download, Trash2, FileType, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMedicalReports, getMedicationLogs, uploadMedicalReport, deleteMedicalReport, getApiError } from '../api';
import { useLang } from '../context/LanguageContext';
import ConfirmDialog from '../components/ConfirmDialog';

const MAX_INLINE_BYTES = 2 * 1024 * 1024; // store files up to 2MB inline for download

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MedicalHistory = () => {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [medicationLog, setMedicationLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // report object
  const fileInputRef = useRef(null);


  const fetchData = () => {
    Promise.all([
      getMedicalReports(),
      getMedicationLogs()
    ]).then(([reportsRes, logsRes]) => {
      setReports(reportsRes.data);
      setMedicationLog(logsRes.data);
    }).catch(err => {
      console.error(err);
      toast.error(t('medicalHistory.loadFail'));
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    toast.loading(t('medicalHistory.uploadLoading'), { id: 'upload-report' });
    try {
      const ext = (file.name.split('.').pop() || 'FILE').toUpperCase();
      const sizeKb = file.size / 1024;
      const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;
      const fileUrl = file.size <= MAX_INLINE_BYTES ? await readFileAsDataUrl(file) : null;

      await uploadMedicalReport({
        name: file.name,
        type: ext,
        size: sizeStr,
        date: new Date().toISOString().slice(0, 10),
        file_url: fileUrl,
      });
      toast.success(t('medicalHistory.uploadSuccess'), { id: 'upload-report' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(getApiError(err, t('medicalHistory.uploadFail')), { id: 'upload-report' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (report) => {
    if (!report.file_url) {
      toast.error(t('medicalHistory.notDownloadable'));
      return;
    }
    const link = document.createElement('a');
    link.href = report.file_url;
    link.download = report.name || 'report';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (report) => {
    try {
      await deleteMedicalReport(report.id);
      setReports(prev => prev.filter(r => r.id !== report.id));
      toast.success(t('medicalHistory.deleteSuccess'));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(getApiError(err, t('medicalHistory.deleteFail')));
    }
  };


  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <FileText className="text-primary-600" size={40} />
            {t('medicalHistory.title')}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{t('medicalHistory.subtitle')}</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelected} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary h-12 px-8 flex items-center gap-2 shadow-primary-500/20 disabled:opacity-60"
        >
           <Plus size={18} /> {uploading ? t('medicalHistory.uploading') : t('medicalHistory.addDocument')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <section className="lg:col-span-2 space-y-6">
           <div className="glass-card p-8">
              <h2 className="text-xl font-black text-slate-800 mb-8 border-s-4 border-primary-500 ps-6">{t('medicalHistory.myDocuments')}</h2>
              <div className="space-y-4">
                 {loading ? <div className="text-center text-slate-400">{t('medicalHistory.loading')}</div> : reports.length === 0 ? <div className="text-center text-slate-400">{t('medicalHistory.noDocuments')}</div> : reports.map((report, i) => (
                   <motion.div
                     key={report.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-white hover:border-primary-100 transition-all group"
                   >
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:scale-110">
                            {report.type === 'PDF' ? <FileType size={24} /> : <Upload size={24} />}
                         </div>
                         <div className="text-start">
                            <h3 className="font-black text-slate-800 text-sm">{report.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">
                               <span>{report.date}</span>
                               <span>•</span>
                               <span>{report.size}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => handleDownload(report)} className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-primary-600 shadow-sm flex items-center justify-center transition-all"><Download size={18} /></button>
                         <button onClick={() => setConfirmDelete(report)} className="h-10 w-10 rounded-xl bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>

           {/* Medical Timeline */}
           <div className="glass-card p-10">
              <h2 className="text-xl font-black text-slate-800 mb-8 border-s-4 border-primary-500 ps-6">{t('medicalHistory.treatmentLog')}</h2>
              <div className="relative border-s-2 border-slate-100 ps-8 ms-4 space-y-12">
                 {loading ? <div className="text-center text-slate-400">{t('medicalHistory.loading')}</div> : medicationLog.length === 0 ? <div className="text-center text-slate-400">{t('medicalHistory.noLog')}</div> : medicationLog.map((log, i) => (
                   <div key={i} className="relative group">
                      <div className="absolute end-[-34px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary-500 group-hover:bg-primary-500 transition-all" />
                      <div className="text-start space-y-2">
                         <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{log.date}</p>
                         <h4 className="font-black text-slate-800 text-lg">{log.med}</h4>
                         <p className="text-sm text-slate-500 font-medium">{log.note}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Sidebar Status/Help */}
        <section className="space-y-6">
           <div className="glass-card p-8 bg-primary-950 text-white border-0 overflow-hidden relative">
              <div className="relative z-10 space-y-6 text-start">
                 <ShieldCheck className="text-primary-400" size={40} />
                 <h3 className="text-xl font-black tracking-tight leading-tight">{t('medicalHistory.verificationStatus')}</h3>
                 <p className="text-xs text-white/50 font-medium leading-relaxed leading-tight text-justify">{t('medicalHistory.verificationDesc')}</p>
                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary-500 h-full w-[60%]" />
                 </div>
                 <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{t('medicalHistory.completion')}</p>
              </div>
              <div className="absolute -bottom-20 -end-20 text-[18rem] opacity-5 select-none pointer-events-none rotate-12">🧘</div>
           </div>

           <div className="glass-card p-8 space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('medicalHistory.quickUpload')}</h4>
              <div
                 onClick={() => !uploading && fileInputRef.current?.click()}
                 className={`p-8 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center gap-4 hover:border-primary-200 transition-all group ${uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform"><Upload size={24} /></div>
                 <p className="text-xs font-black text-slate-500">{uploading ? t('medicalHistory.uploading') : t('medicalHistory.dropHint')}</p>
              </div>
           </div>
        </section>
      </div>
      <ConfirmDialog
        open={!!confirmDelete}
        variant="delete"
        message={confirmDelete ? `${t('medicalHistory.deleteConfirmPre')} ${confirmDelete.name} ${t('medicalHistory.deleteConfirmPost')}` : ''}
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default MedicalHistory;
