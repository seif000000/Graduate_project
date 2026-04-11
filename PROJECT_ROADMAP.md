# 🏥 مسند — خارطة طريق إتمام المشروع

> **آخر تحديث:** أبريل 2026  
> هذا المستند هو دليلك الكامل لإنهاء المشروع وربطه بالداتا بيز ورفعه على السيرفر.

---

## 📊 أولاً: تحليل شامل لكل الصفحات

### ✅ صفحات تعمل بالكامل (Frontend + Backend)
| الصفحة | الرابط | الحالة |
|---|---|---|
| تسجيل الدخول | `/login` | ✅ يعمل + JWT |
| إنشاء حساب | `/register` | ✅ يعمل |
| الملف الشخصي | `/profile` | ✅ يعمل مع API |
| الإعدادات | `/settings` | ✅ مع toast |
| لوحة الإشراف (Admin) | `/admin` | ✅ يجلب بيانات حقيقية |
| إدارة المستخدمين | `/admin/users` | ✅ يعمل |
| إحصائيات الأدوية | `/admin/analytics` | ✅ يعمل |
| التقارير | `/admin/reports` | ✅ يعمل |
| طلبات الاستغاثة | `/emergency` | ✅ يجلب ويرسل بيانات |
| مخزون الصيدلية | `/pharmacy-inventory` | ✅ يعمل |
| الأدوية قريبة الانتهاء | `/near-expiry` | ✅ يعمل |
| إحصائيات الصيدلية | `/pharmacy/stats` | ✅ يعمل |
| التحكم في الأسعار | `/pharmacy/pricing` | ✅ (بيانات وهمية مؤقتة) |
| البحث عن الدواء | `/search` | ✅ يعمل + تحديد الموقع |
| الخريطة التفاعلية | `/map` | ✅ (خريطة محاكاة - تحتاج Google Maps) |
| الإشعارات | `/notifications` | ✅ يعمل |
| طلباتي | `/requests` | ✅ يعمل |
| مجتمع مسند | `/community` | ✅ مع toast |
| المساعد الذكي | `/health-ai` | ✅ يعمل (يحتاج OpenAI Key) |

### ⚠️ صفحات تعمل جزئياً (Frontend فقط)
| الصفحة | الرابط | المشكلة |
|---|---|---|
| التبرع بدواء | `/donate` | ⚠️ النموذج موجود لكن إرسال البيانات للباك يحتاج اختبار |
| الصندوق (Inbox) | `/inbox` | ⚠️ بيانات وهمية محلية — WebSocket غير مربوط |
| مركز المساعدة | `/help-center` | ⚠️ محتوى ثابت فقط (Static) |
| توثيق الحساب | `/account-verification` | ⚠️ UI موجود — API Upload غير مكتمل |
| السجل الطبي | `/medical-history` | ⚠️ بيانات وهمية — لا يوجد موديل في الباك |
| كوبوناتي | `/vouchers` | ⚠️ بيانات وهمية — لا يوجد API للكوبونات |
| لوحة المتبرع | `/dashboard` | ⚠️ بيانات من localStorage فقط |

### ❌ صفحات تحتاج عمل (لا توجد في الباك)
| الصفحة | ما يلزم |
|---|---|
| `/vouchers` | موديل + API كامل للكوبونات |
| `/medical-history` | موديل MedicalRecord + CRUD |
| `/inbox` | WebSocket أو Polling API |
| `/account-verification` | API رفع ملفات (S3 أو Cloudinary) |

---

## 🗄️ ثانياً: ربط الداتا بيز خطوة خطوة

### الخطوة 1 — إنشاء ملف `.env` في مجلد `backend/`
أنشئ الملف `backend/.env` وبداخله:

```bash
# للتطوير المحلي (أسرع وأسهل - SQLite)
DATABASE_URL=sqlite:///./musnad.db
SECRET_KEY=musnad-super-secret-key-change-in-production-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# مفتاح OpenAI للمساعد الذكي (اختياري)
OPENAI_API_KEY=sk-...
```

### الخطوة 2 — تشغيل الباك لإنشاء الجداول أوتوماتيك
```powershell
# Terminal 1: تشغيل الباك
cd D:\vs2\Graduate_Project\backend
python -m app.main
```
> عند أول تشغيل، `SQLModel` ينشئ كل الجداول تلقائياً من الموديلات.
> ستجد ملف `musnad.db` في مجلد `backend/`.

```powershell
# Terminal 2: تشغيل الفرونت
cd D:\vs2\Graduate_Project
npm run dev
```

### الخطوة 3 — إنشاء أول Admin (مرة واحدة فقط)
بعد تشغيل السيرفر، افتح المتصفح على:
```
http://localhost:8000/docs
```
ثم اعمل `POST /api/v1/auth/register` بهالداتا:
```json
{
  "full_name": "مدير مسند",
  "email": "admin@musnad.com",
  "password": "admin123",
  "role": "admin"
}
```

### الخطوة 4 — اختبار كامل
1. افتح `http://localhost:5173`
2. سجل دخول بـ `admin@musnad.com` / `admin123`
3. هتلاقي نفسك Admin وكل الصفحات شغاله

---

## 🚀 ثالثاً: رفع المشروع على السيرفر (Deployment)

### الخيار A — رخيص وسهل ⭐ (Vercel + Railway)

#### الباك (FastAPI) على Railway:
1. اعمل حساب على [railway.app](https://railway.app)
2. اعمل مشروع جديد من GitHub
3. اختار مجلد `backend/` كـ Root Directory
4. Railway هيكتشف FastAPI أوتوماتيك
5. أضف متغيرات البيئة:
   - `DATABASE_URL` → اختار **Add PostgreSQL** من Railway نفسه (مجاني)
   - `SECRET_KEY` → ضع قيمة عشوائية طويلة
6. Railway هيديك URL زي: `https://musnad-api.railway.app`

#### الفرونت (React) على Vercel:
1. اعمل حساب على [vercel.com](https://vercel.com)
2. اربطه بـ GitHub
3. قبل الرفع، غير في `src/api.js`:
   ```js
   const BASE_URL = 'https://musnad-api.railway.app/api/v1';
   ```
4. ارفع المشروع الأساسي (مش مجلد backend)
5. Vercel هيبني `npm run build` أوتوماتيك

---

### الخيار B — احترافي (VPS - DigitalOcean/Hetzner)

#### للـ Backend:
```bash
# على السيرفر (Ubuntu)
sudo apt install python3-pip python3-venv nginx -y
git clone <your-repo>
cd Graduate_Project/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# أنشئ ملف .env مع DATABASE_URL لـ PostgreSQL
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### للـ Frontend:
```bash
cd Graduate_Project
npm install
npm run build
# اعمل Nginx يخدم مجلد dist/
```

---

## ✅ رابعاً: كل الفيتشرز المطلوبة وحالتها

| الفيتشر | الحالة |
|---|---|
| تسجيل دخول/خروج بـ JWT | ✅ مكتمل |
| 3 أنواع مستخدمين (Admin / Pharmacy / User) | ✅ مكتمل |
| توثيق الصيدليات من الأدمن | ✅ مكتمل |
| بحث الأدوية مع فلتر | ✅ مكتمل |
| تبرع بدواء | ✅ مكتمل |
| لوحة استغاثة عاجلة (SOS Board) | ✅ مكتمل |
| الرد على طلبات الاستغاثة | ✅ مكتمل |
| إدارة مخزون الصيدلية | ✅ مكتمل |
| تنبيه الأدوية قريبة الانتهاء | ✅ مكتمل |
| تحكم في الأسعار والخصومات | ⚠️ UI فقط |
| إحصائيات المنصة (Admin) | ✅ مكتمل |
| إحصائيات الصيدلية | ✅ مكتمل |
| ملف شخصي قابل للتعديل | ✅ مكتمل |
| نظام إشعارات | ✅ مكتمل |
| مساعد ذكاء اصطناعي (AI Chat) | ✅ (يحتاج OpenAI Key) |
| خريطة تفاعلية | ⚠️ محاكاة (يحتاج Google Maps Key) |
| نظام كوبونات | ❌ يحتاج موديل + API |
| سجل طبي للمريض | ❌ يحتاج موديل + API |
| Inbox (Chat) | ❌ يحتاج WebSocket |
| Error Handling (Toast) | ✅ مكتمل بـ react-hot-toast |
| Responsive Design | ✅ مكتمل (موبايل + تاب + لابتوب) |
| RTL Arabic Full Support | ✅ Cairo Font + RTL كامل |

---

## 🔜 الأولوية المقترحة بالترتيب

```
المرحلة 1 — التشغيل المحلي (الآن)
  1. أنشئ ملف backend/.env
  2. شغّل الباك: cd backend && python -m app.main
  3. شغّل الفرونت: npm run dev
  4. اعمل حساب admin من http://localhost:8000/docs
  5. جرب كل الصفحات

المرحلة 2 — إكمال الفيتشرز الناقصة
  6. ربط Dashboard بـ API حقيقي
  7. إضافة موديل Voucher + API
  8. إضافة موديل MedicalHistory + API

المرحلة 3 — الرفع (Deployment)
  9. ارفع الباك على Railway
  10. غير BASE_URL في src/api.js
  11. ارفع الفرونت على Vercel
```

---

> 💡 **ملاحظة:** الداتا بيز الحالية SQLite تناسب التطوير المحلي.
> لما تيجي تنزل على السيرفر، حوّل لـ PostgreSQL بمجرد تغيير `DATABASE_URL`.
