# نظام النمو الكامل — توثيق التحديثات

**تاريخ التطبيق:** 16 مارس 2026  
**الفرع:** `main`  
**المشروع:** hardisk — تطبيق تعدين Bitcoin

---

## نظرة عامة

تمّ تطبيق نظام نمو شامل من **6 ركائز** على التطبيق، بهدف زيادة قاعدة المستخدمين بشكل عضوي. جميع الروابط العامة تستخدم `https://hardisk.co` حصرياً.

---

## الركائز الستة

| # | الركيزة | الوصف |
|---|---------|-------|
| 1 | **Starter Miner مجاني** | يُمنح تلقائياً عند إنشاء الحساب |
| 2 | **طبقة المشاركة** | بطاقات مشاركة + روابط `hardisk.co/r/CODE` |
| 3 | **صفحات الثقة والشفافية** | أرقام حقيقية، لا وعود مبالغ فيها |
| 4 | **نظام الإحالة المؤهلة** | $10 USDT تُضاف تلقائياً عند إنفاق الصديق $50+ |
| 5 | **نادي المؤسسين** | أول 500 مستخدم يحصلون على شارة دائمة |
| 6 | **مسار السفراء** | برنامج تقدّم واعتماد للمستخدمين النشطين |

---

## قاعدة البيانات

### ملف الـ Migration
**`migrations/0004_growth_system.sql`**

```sql
-- أعمدة جديدة على جدول users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_sequence INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_status TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_applied_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_approved_at TIMESTAMP;

-- جداول جديدة
CREATE TABLE starter_rewards (...);       -- مكافأة المعدّن المجاني (فريدة لكل مستخدم)
CREATE TABLE referral_events (...);       -- سجل أحداث الإحالة مع idempotency_key
CREATE TABLE founder_members (...);       -- أعضاء نادي المؤسسين بالترتيب
CREATE TABLE growth_badges (...);         -- شارات المستخدمين
```

**الجداول الأربعة الجديدة:**

| الجدول | الغرض | قيود |
|--------|-------|------|
| `starter_rewards` | تسجيل منح المعدّن المجاني | `UNIQUE(user_id)` — مرة واحدة فقط |
| `referral_events` | سجل تدقيق كامل للإحالات | `UNIQUE(idempotency_key)` — منع التكرار |
| `founder_members` | أعضاء نادي المؤسسين | `UNIQUE(sequence)` — رقم تسلسلي فريد |
| `growth_badges` | شارات لكل مستخدم | — |

---

## الـ Schema — `shared/schema.ts`

أُضيفت 6 أعمدة جديدة على جدول `users`:

```typescript
isFounder: boolean | null          // هل هو عضو مؤسس؟
founderSequence: number | null     // رقمه التسلسلي (1–500)
isAmbassador: boolean | null       // هل هو سفير؟
ambassadorStatus: string | null    // 'none' | 'pending' | 'active' | 'rejected'
ambassadorAppliedAt: Date | null   // تاريخ التقديم
ambassadorApprovedAt: Date | null  // تاريخ القبول
```

وأُضيفت أنواع TypeScript للجداول الأربعة الجديدة:
- `StarterReward` / `InsertStarterReward`
- `ReferralEvent` / `InsertReferralEvent`
- `FounderMember` / `InsertFounderMember`
- `GrowthBadge` / `InsertGrowthBadge`

---

## الـ Backend — ملفات الخادم

### 1. `server/services/growthService.ts` — الخدمة المركزية

الدوال الرئيسية:

| الدالة | الوصف |
|--------|-------|
| `getPublicBaseUrl()` | يُعيد `PUBLIC_APP_URL` أو `https://hardisk.co` |
| `makeReferralLink(code)` | ينتج رابط `https://hardisk.co/r/CODE` |
| `grantStarterMiner(userId)` | يمنح 0.5 TH/s مجاناً — idempotent بشكل كامل |
| `attributeReferral(userId, code)` | يربط المستخدم بالمُحيل عند التسجيل |
| `qualifyReferral(userId, data)` | يدفع $10 USDT تلقائياً عند تأهّل الإحالة |
| `getReferralStats(userId)` | إحصائيات الإحالة — العدد والأرباح والتاريخ |
| `checkAndGrantFounderStatus(userId)` | يتحقق من الـ cap ويمنح شارة المؤسس |
| `getFounderStats()` | cap / claimed / remaining / pct |
| `applyForAmbassador(userId)` | تقديم طلب سفير |
| `approveAmbassador(userId, adminId)` | قبول طلب سفير (admin) |
| `getGrowthProfile(userId)` | جميع بيانات النمو في استدعاء واحد |
| `getPlatformStats()` | أرقام حقيقية لصفحة الشفافية |
| `getShareCardData(userId)` | بيانات بطاقات المشاركة |

---

### 2. `server/growth-routes.ts` — نقاط الـ API

#### Public (لا يتطلب تسجيل دخول)
```
GET  /api/growth/referral-info/:code  — اسم المُحيل + هل هو مؤسس
GET  /api/growth/founder-stats        — cap / claimed / remaining
GET  /api/growth/platform-stats       — أرقام المنصة للشفافية
GET  /r/:code                         — صفحة HTML كاملة مع OG meta + redirect
GET  /.well-known/apple-app-site-association — لـ Universal Links
```

#### Auth Required
```
POST /api/growth/attribute-referral          — ربط الإحالة
GET  /api/growth/profile/:userId             — ملف النمو الكامل
GET  /api/growth/starter-reward/:userId      — حالة المعدّن المجاني
GET  /api/growth/referral-stats/:userId      — إحصائيات الإحالات
GET  /api/growth/share-card/:userId          — بيانات بطاقة المشاركة
GET  /api/growth/badges/:userId              — شارات المستخدم
POST /api/growth/ambassador/apply            — تقديم طلب سفير
```

#### Admin Only
```
POST /api/growth/admin/ambassador/approve/:userId — قبول سفير
GET  /api/growth/admin/ambassadors                — قائمة الطلبات
POST /api/growth/admin/founder/grant/:userId      — منح شارة مؤسس يدوياً
GET  /api/growth/admin/founders                   — قائمة المؤسسين
GET  /api/growth/admin/referral-events            — سجل تدقيق كامل
POST /api/growth/qualify-referral/:userId         — تأهيل إحالة يدوياً
```

---

### 3. ملفات الخادم المعدّلة

#### `server/index.ts`
```typescript
// أُضيف
import { registerGrowthRoutes } from "./growth-routes";
registerGrowthRoutes(app);
```

#### `server/services/authService.ts`
```typescript
// يُمنح المعدّن المجاني تلقائياً عند إنشاء حساب جديد
// fire-and-forget حتى لا يعطّل استجابة Auth
setImmediate(async () => {
  await growthService.grantStarterMiner(newUser.id);
});
```

#### `server/routes.ts`
- `/api/auth/sync` — يقرأ `referralCode` من الـ body ويستدعي `attributeReferral()`
- Stripe Webhook `payment_intent.succeeded` — يستدعي `qualifyReferral()` تلقائياً

#### `server/ensure-tables.ts`
يُنشئ الجداول تلقائياً عند تشغيل الخادم بدون الحاجة لتشغيل migration يدوياً.

#### `server/storage.ts`
أُضيفت الأعمدة الستة الجديدة للـ in-memory storage لإزالة خطأ TypeScript.

---

## الـ Frontend — صفحات جديدة

### 1. `client/src/pages/GrowthHub.tsx` — الصفحة الرئيسية للنمو

**المسار:** `/growth`

- Hero banner مع تدرج ألوان برتقالي
- `StarterMinerCard` — عرض حالة المعدّن المجاني
- رابط الإحالة مع زر نسخ
- عرض الشارات
- شبكة 4 عناصر (Starter / Referrals / Founders / Ambassador)
- شريط ثقة يربط بـ How It Works / Transparency / Referral Terms

---

### 2. `client/src/pages/StarterMiner.tsx` — تفاصيل المعدّن المجاني

**المسار:** `/growth/starter`

- عرض الـ hashrate بـ 0.5 TH/s مع animation
- شريط تقدم المدة (30 يوم)
- إجمالي الأرباح بـ Satoshis
- خطوات كيفية عمله
- زر ترقية يوجه لشراء hashrate إضافية

---

### 3. `client/src/pages/Founders.tsx` — نادي المؤسسين

**المسار:** `/founders`

- Hero مع تدرج بنفسجي
- عرض شارة المؤسس الخاصة بالمستخدم (إن كان مؤسساً)
- شريط تقدم حقيقي: X/500 مطالَب بها
- تفاصيل 3 مستويات:
  - **Founding Tier** (1–100): أعلى المزايا
  - **Early Adopter** (101–300)
  - **Community** (301–500)
- كيفية التأهل
- زر مشاركة رابط الإحالة

---

### 4. `client/src/pages/Ambassador.tsx` — برنامج السفراء

**المسار:** `/ambassador`

- Hero بتدرج برتقالي/أصفر
- عرض الحالة الحالية: غير متقدم / قيد المراجعة / نشط / مرفوض
- قائمة المزايا الـ 5
- متطلبات البرنامج
- كيفية العمل (3 خطوات)
- زر التقديم (`POST /api/growth/ambassador/apply`)

---

### 5. `client/src/pages/Transparency.tsx` — الشفافية

**المسار:** `/transparency`

- أرقام مباشرة من قاعدة البيانات:
  - إجمالي المستخدمين
  - المعدّنون النشطون
  - مستخدمو نادي المؤسسين
  - إجمالي العمولات المدفوعة
  - أحداث المكافآت
- هيكل الرسوم الكامل
- تفاصيل البنية التحتية (GCP, Neon, Firebase, Stripe)
- شرح كيفية عمل مكافآت التعدين

---

### 6. `client/src/pages/HowItWorks.tsx` — كيف يعمل التطبيق

**المسار:** `/how-it-works`

- 5 خطوات مرئية مع أيقونات ملونة:
  1. تسجيل الدخول والحصول على معدّن مجاني
  2. المعدّن يعمل 24/7
  3. دعوة الأصدقاء وكسب $10
  4. نادي المؤسسين
  5. برنامج السفراء
- أسئلة شائعة (4 أسئلة)

---

### 7. `client/src/pages/ReferralTerms.tsx` — شروط الإحالة

**المسار:** `/referral-terms`

- الأرقام الأساسية: $10 / $50 / غير محدود
- ما يُعتبر إحالة مؤهلة (4 شروط)
- ما لا يُعتبر مؤهلاً (5 حالات)
- سياسة مكافحة الاحتيال
- تفاصيل صرف المكافآت

---

### 8. `client/src/pages/ReferralLanding.tsx` — صفحة الدعوة

**المسار:** `/r/:code`

- يحفظ الـ referral code في `localStorage` فوراً عند التحميل
- يجلب اسم المُحيل من API + هل هو مؤسس (يعرض أيقونة Crown)
- بطاقة دعوة مع 3 مزايا مرئية
- زر CTA يوجه لـ `/auth?ref=CODE`

---

## الـ Components الجديدة

### `client/src/components/StarterMinerCard.tsx`
بطاقة قابلة لإعادة الاستخدام تعرض:
- نسبة النشاط + شريط تقدم
- الـ hashrate والمدة المتبقية
- زر "View Details" يوجه لـ `/growth/starter`

### `client/src/components/FounderBadge.tsx`
شارة مرئية مع:
- حلقة متدرجة حسب المستوى
- رقم تسلسلي
- label المستوى
- 3 أحجام: `sm`, `md`, `lg`

---

## ملفات الـ Frontend المعدّلة

### `client/src/App.tsx`

**Lazy imports جديدة:**
```typescript
const GrowthHub = lazy(...)
const StarterMiner = lazy(...)
const Founders = lazy(...)
const Ambassador = lazy(...)
const Transparency = lazy(...)
const HowItWorks = lazy(...)
const ReferralTerms = lazy(...)
const ReferralLanding = lazy(...)
```

**Routes جديدة:**
```
/r/:code          → ReferralLanding
/growth           → GrowthHub
/growth/starter   → StarterMiner
/founders         → Founders
/ambassador       → Ambassador
/transparency     → Transparency
/how-it-works     → HowItWorks
/referral-terms   → ReferralTerms
```

**التقاط `?ref=` من URL:**
```typescript
const urlRef = new URLSearchParams(window.location.search).get("ref");
if (urlRef) localStorage.setItem("ref", urlRef);
```

**إرسال referral code في `/api/auth/sync`:**
```typescript
const refCode = localStorage.getItem("ref") || undefined;
body: JSON.stringify(refCode ? { referralCode: refCode } : {})
```

---

### `client/src/pages/Referral.tsx`

**الإصلاح الأساسي — رابط الإحالة:**
```typescript
// قبل (خاطئ):
`${window.location.origin}/signup?ref=${code}`

// بعد (صحيح):
const publicBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL || "https://hardisk.co";
`${publicBaseUrl}/r/${code}`
```

---

### `client/src/pages/Dashboard.tsx`

أُضيفت بطاقة **Growth Hub** في قسم "Premium Features":
- أيقونة برتقالية
- وصف: "Free Miner · Referrals · Founding Club"
- رابط مباشر لـ `/growth`

---

## متغيرات البيئة الجديدة — `.env`

```env
PUBLIC_APP_URL=https://hardisk.co
VITE_PUBLIC_APP_URL=https://hardisk.co
STARTER_HASHRATE_THS=0.5
STARTER_DURATION_DAYS=30
FOUNDER_CAP=500
REFERRAL_REWARD_USD=10
REFERRAL_QUALIFY_MIN_USD=50
```

---

## ضمانات الجودة

| المعيار | الحالة |
|---------|--------|
| TypeScript errors | ✅ 0 أخطاء |
| روابط Codespaces في الإنتاج | ✅ لا يوجد — كل شيء `hardisk.co` |
| مكافأة مزدوجة (double reward) | ✅ محمي بـ `UNIQUE(idempotency_key)` |
| self-referral | ✅ محظور في `growthService.ts` |
| تعطيل auth عند منح المعدّن | ✅ fire-and-forget بـ `setImmediate` |
| Migration مطبّق | ✅ مؤكد على Neon DB |
| جداول تُنشأ تلقائياً | ✅ عبر `ensure-tables.ts` |

---

## مسار المستخدم الكامل

```
1. مستخدم يفتح hardisk.co/r/ABC123
   → ReferralLanding يحفظ "ref=ABC123" في localStorage
   → يضغط "Claim Your Free Miner"

2. يصل لصفحة Auth
   → يسجّل حساباً جديداً بـ Firebase

3. App.tsx يستدعي /api/auth/sync مع { referralCode: "ABC123" }
   → authService يُنشئ المستخدم
   → growthService.attributeReferral() يربطه بالمُحيل
   → growthService.grantStarterMiner() يمنحه 0.5 TH/s

4. المستخدم يشتري hashrate بـ $50+
   → Stripe webhook يُطلق qualifyReferral()
   → المُحيل يحصل على $10 USDT تلقائياً
   → كلاهما يتلقيان إشعاراً
```

---

*آخر تحديث: 16 مارس 2026*
