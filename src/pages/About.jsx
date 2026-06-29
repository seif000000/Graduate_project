import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Heart, Code2, Cpu, Globe, BookOpen } from 'lucide-react';

// ══════════════════════════════════════════════════════════════
//  🔧 EDIT YOUR TEAM HERE
//  - name: اسم العضو
//  - role: الوظيفة / التخصص
//  - bio: وصف مختصر
//  - photo: ضع رابط الصورة هنا (URL أو import من assets)
//  - github / linkedin / email: روابط التواصل (اتركها فاضية لو مش موجودة)
// ══════════════════════════════════════════════════════════════
const TEAM = [
  {
    name: 'سيف',
    role: 'Full-Stack Developer',
    bio: 'مسؤول عن تطوير الـ Frontend والـ Backend وبنية المشروع الكاملة.',
    photo: '',   // ← ضع رابط الصورة هنا
    github: '',
    linkedin: '',
    email: '',
    color: 'from-emerald-400 to-teal-600',
    icon: Code2,
  },
  {
    name: 'اسم العضو الثاني',
    role: 'UI/UX Designer',
    bio: 'مسؤول عن تصميم واجهة المستخدم وتجربة الاستخدام.',
    photo: '',   // ← ضع رابط الصورة هنا
    github: '',
    linkedin: '',
    email: '',
    color: 'from-blue-400 to-indigo-600',
    icon: Globe,
  },
  {
    name: 'اسم العضو الثالث',
    role: 'AI & Data Specialist',
    bio: 'مسؤول عن تكامل الذكاء الاصطناعي وتحليل البيانات.',
    photo: '',   // ← ضع رابط الصورة هنا
    github: '',
    linkedin: '',
    email: '',
    color: 'from-violet-400 to-purple-600',
    icon: Cpu,
  },
  {
    name: 'اسم العضو الرابع',
    role: 'Backend Developer',
    bio: 'مسؤول عن تطوير الـ API وقاعدة البيانات.',
    photo: '',   // ← ضع رابط الصورة هنا
    github: '',
    linkedin: '',
    email: '',
    color: 'from-amber-400 to-orange-500',
    icon: BookOpen,
  },
];

// ══════════════════════════════════════════════════════════════
//  🔧 PLATFORM STATS
// ══════════════════════════════════════════════════════════════
const STATS = [
  { label: 'تبرعات دواء', value: '500+' },
  { label: 'مستخدم مسجل', value: '200+' },
  { label: 'صيدلية شريكة', value: '30+' },
  { label: 'استغاثة تم الرد عليها', value: '150+' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Avatar placeholder when no photo provided
function Avatar({ name, color }) {
  const initials = name
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <div
      className={`w-full h-full rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}
    >
      <span className="text-white text-4xl font-black">{initials}</span>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-primary-100 hover:text-primary-600 text-slate-500 flex items-center justify-center transition-all hover:scale-110"
    >
      <Icon size={16} />
    </a>
  );
}

function MemberCard({ member, index }) {
  const Icon = member.icon;
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col"
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${member.color}`} />

      {/* Icon badge */}
      <div
        className={`absolute top-6 left-6 w-10 h-10 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg opacity-90`}
      >
        <Icon size={18} className="text-white" />
      </div>

      {/* Photo */}
      <div className="flex justify-center pt-10 pb-4">
        <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-xl overflow-hidden">
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar name={member.name} color={member.color} />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pb-6 flex flex-col flex-grow text-center">
        <h3 className="text-xl font-black text-slate-800 mb-1">{member.name}</h3>
        <span
          className={`self-center text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${member.color} text-white mb-3`}
        >
          {member.role}
        </span>
        <p className="text-slate-500 text-sm leading-relaxed flex-grow">{member.bio}</p>

        {/* Social links */}
        {(member.github || member.linkedin || member.email) && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <SocialLink href={member.github} icon={Github} label="GitHub" />
            <SocialLink href={member.linkedin} icon={Linkedin} label="LinkedIn" />
            <SocialLink
              href={member.email ? `mailto:${member.email}` : ''}
              icon={Mail}
              label="Email"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]" dir="rtl">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-teal-500 text-white">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="w-20 h-20 mx-auto mb-6 bg-white/15 backdrop-blur rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Heart size={38} className="text-white fill-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-5xl md:text-6xl font-black mb-4 tracking-tight"
          >
            من نحن
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            مُسند — منصة تخرج مبادره  تهدف إلى ربط المتبرعين بالدواء بمن يحتاج إليه،
            مع دعم ذكي لمرضى السكري وارتفاع ضغط الدم.
          </motion.p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 text-center"
            >
              <p className="text-3xl font-black text-primary-600">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── About the project ─────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-black text-slate-800 mb-4">عن المشروع</h2>
          <p className="text-slate-600 leading-loose text-base">
            مُسند هو مشروع تخرج تم تطويره كحل مبتكر لمشكلة نقص الأدوية وتكدسها في نفس الوقت.
            تتيح المنصة للمستخدمين التبرع بالأدوية غير المستخدمة، والبحث عن الأدوية المتاحة
            بالقرب منهم مجاناً أو بسعر رمزي، مع نظام استغاثة فوري لحالات الطوارئ ومساعد ذكاء
            اصطناعي متخصص في إرشاد مرضى السكري وارتفاع ضغط الدم.
          </p>
        </motion.div>
      </div>

      {/* ── Team ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-black text-slate-800 mb-3">فريق العمل</h2>
          <p className="text-slate-500">الفريق الذي بنى مُسند من الصفر</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <MemberCard key={i} member={member} index={i} />
          ))}
        </div>
      </div>

      {/* ── Footer note ───────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-white py-8 text-center">
        <p className="text-slate-400 text-sm">
          صُنع بـ <Heart size={12} className="inline text-red-400 fill-red-400" /> في مصر &mdash; مشروع تخرج {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
