# Auto-Deploy Setup for Cloud Run

## ✅ الوضع الحالي
التطبيق deployed على:
- **Service**: mining-club
- **Region**: us-central1
- **URL**: https://mining-club-1181184514.us-central1.run.app

---

## 🚀 إعداد Auto-Deploy من GitHub

### الطريقة الأولى: Cloud Build Trigger (موصى بها)

#### الخطوات:

1. **روح Cloud Build Triggers**
   ```
   https://console.cloud.google.com/cloud-build/triggers?project=blockmint-393d2
   ```

2. **اضغط "Create Trigger"**

3. **اختار المستودع**:
   - Source: `GitHub`
   - Repository: `GitBodda/mining-club` (أو `xObad/blockmint`)
   - Branch: `^main$`

4. **Configuration**:
   - Type: `Cloud Build configuration file`
   - Location: `Repository` 
   - File: `cloudbuild.yaml`

5. **متغيرات Substitution (مهم جداً)**:
   ```
   _VITE_FIREBASE_API_KEY = AIzaSyCjBfwZr4k6mGHLjrhdXmlcV0ODH_6CuP0
   _VITE_FIREBASE_PROJECT_ID = blockmint-393d2
   _VITE_FIREBASE_APP_ID = 1:1181184514:web:3474e047892c119fa3ad1b
   _VITE_FIREBASE_AUTH_DOMAIN = blockmint-393d2.firebaseapp.com
   _VITE_FIREBASE_STORAGE_BUCKET = blockmint-393d2.firebasestorage.app
   ```

6. **اضغط "Create"**

الآن كل push على `main` هيعمل deploy تلقائي! 🎉

---

### الطريقة الثانية: Manual Deploy (الطريقة الحالية)

كل ما تعمل تعديل وتعمل push، اعمل:

```bash
gcloud run deploy mining-club --source . --region us-central1
```

---

## 🌐 ربط الدومين

### من Console (أسهل):

1. روح [Cloud Run](https://console.cloud.google.com/run?project=blockmint-393d2)
2. اضغط على `mining-club`
3. من التبويب **"Domain Mappings"** → اضغط "**ADD MAPPING**"
4. دخّل الدومين بتاعك (مثلاً `app.blockmint.io`)
5. Cloud Run هيديك DNS records زي:
   ```
   Type: A
   Name: app
   Value: 216.239.32.21
   
   Type: AAAA
   Name: app
   Value: 2001:4860:4802:32::15
   ```
6. روح لمسجّل الدومين بتاعك (Namecheap, GoDaddy, إلخ) وحط الـ records دي
7. استنى 10-30 دقيقة → SSL هيتفعّل تلقائي ✅

---

## 📊 مراقبة التطبيق

- **Logs**: https://console.cloud.google.com/logs/query?project=blockmint-393d2
- **Metrics**: https://console.cloud.google.com/run/detail/us-central1/mining-club/metrics?project=blockmint-393d2
- **Revisions**: شوف كل الـ deployments وارجع لأي revision قديم

---

## 💰 التكلفة المتوقعة

| المورد | Free Tier | التقدير الشهري |
|--------|-----------|----------------|
| Cloud Run | 2M طلب مجاناً | $0-15 |
| Cloud Build | 120 دقيقة/يوم | $0 |
| Secret Manager | 6 إصدارات | $0 |
| **الإجمالي** | | **$0-20/شهر** |

---

## 🔐 الـ Secrets المستخدمة

- `neon_database_url` → Database connection
- `firebase_service_account_json` → Firebase Admin SDK
- `resend_api_key` → Support emails

---

## ⚡ نصائح مهمة

1. **Cold Starts**: لو حاببت التطبيق يفضل شغّال دايماً، غيّر `--min-instances` من 0 لـ 1 (هيزود التكلفة شوية)

2. **Monitoring**: فعّل **Cloud Trace** عشان تشوف أداء الـ requests:
   ```bash
   gcloud services enable cloudtrace.googleapis.com
   ```

3. **CDN**: لو عندك traffic عالي، استخدم **Cloud CDN** عشان تسرّع الـ static assets

4. **Health Checks**: Cloud Run بيعملها automatic على `/`

---

## 🆘 حل المشاكل

### Build بيفشل؟
```bash
# شوف الـ logs
gcloud builds list --limit=5
gcloud builds log <BUILD_ID>
```

### Service مش شغّال؟
```bash
# شوف الـ logs في real-time
gcloud run services logs read mining-club --region us-central1 --limit=50
```

### محتاج تغيّر الإعدادات؟
```bash
# زوّد الـ memory
gcloud run services update mining-club --memory 1Gi --region us-central1

# زوّد الـ timeout
gcloud run services update mining-club --timeout 600 --region us-central1
```
