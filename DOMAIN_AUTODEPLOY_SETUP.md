# ربط الدومين hardisk.co وتفعيل Auto-Deploy

## 🌐 الخطوة 1: ربط الدومين hardisk.co

### من Console (أسهل طريقة):

1. **افتح Cloud Run Console**:
   ```
   https://console.cloud.google.com/run/detail/us-central1/mining-club?project=blockmint-393d2
   ```

2. **اضغط على تبويب "DOMAIN MAPPINGS"** (في الأعلى)

3. **اضغط "ADD MAPPING"**

4. **اختار**:
   - Service: `mining-club`
   - Domain: `hardisk.co` (أو `www.hardisk.co` إذا أردت)

5. **Cloud Run هيديك DNS Records زي كده**:
   ```
   Type: A
   Name: @
   Value: 216.239.32.21
   
   Type: A
   Name: @
   Value: 216.239.34.21
   
   Type: A
   Name: @
   Value: 216.239.36.21
   
   Type: A
   Name: @
   Value: 216.239.38.21
   
   Type: AAAA
   Name: @
   Value: 2001:4860:4802:32::15
   
   Type: AAAA
   Name: @
   Value: 2001:4860:4802:34::15
   
   Type: AAAA
   Name: @
   Value: 2001:4860:4802:36::15
   
   Type: AAAA
   Name: @
   Value: 2001:4860:4802:38::15
   ```

6. **روح لمسجّل الدومين hardisk.co** وحط الـ Records دي:
   - لو الدومين على **Namecheap**: روح Advanced DNS → Add New Record
   - لو على **GoDaddy**: روح DNS Management → Add Record
   - لو على **Cloudflare**: روح DNS → Add Record

7. **استنى 10-60 دقيقة** → الـ SSL هيتفعّل تلقائياً ✅

---

## 🚀 الخطوة 2: تفعيل Auto-Deploy من GitHub

### إعداد Cloud Build Trigger:

1. **افتح Cloud Build Triggers**:
   ```
   https://console.cloud.google.com/cloud-build/triggers?project=blockmint-393d2
   ```

2. **اضغط "CREATE TRIGGER"**

3. **املأ البيانات**:
   
   **Event**: 
   - ✅ Push to a branch
   
   **Source**:
   - Repository provider: `GitHub`
   - اضغط "CONNECT NEW REPOSITORY"
   - اختار `GitBodda/mining-club` أو `xObad/blockmint`
   - Confirm
   
   **Branch**:
   - Branch: `^main$` (regex)
   
   **Configuration**:
   - Type: `Cloud Build configuration file (yaml or json)`
   - Location: `Repository`
   - Cloud Build configuration file location: `/cloudbuild.yaml`

4. **Substitution variables (مهم جداً!)**:
   
   اضغط "ADD VARIABLE" واحط الـ 5 متغيرات دول:
   
   ```
   _VITE_FIREBASE_API_KEY
   AIzaSyCjBfwZr4k6mGHLjrhdXmlcV0ODH_6CuP0
   
   _VITE_FIREBASE_PROJECT_ID
   blockmint-393d2
   
   _VITE_FIREBASE_APP_ID
   1:1181184514:web:3474e047892c119fa3ad1b
   
   _VITE_FIREBASE_AUTH_DOMAIN
   blockmint-393d2.firebaseapp.com
   
   _VITE_FIREBASE_STORAGE_BUCKET
   blockmint-393d2.firebasestorage.app
   ```

5. **Service account** (اختياري):
   - لو سألك عن Service Account، اختار "Default"
   - أو سيبه فاضي

6. **اضغط "CREATE"** ✅

---

## ✅ التأكد من الإعداد

### بعد ما تعمل Push على GitHub:

1. **روح Cloud Build History**:
   ```
   https://console.cloud.google.com/cloud-build/builds?project=blockmint-393d2
   ```

2. **لازم تشوف Build جديد بيشتغل تلقائياً** 🎉

3. **لو Build failed**:
   - اضغط على Build → شوف الـ Logs
   - غالباً المشكلة في الـ Substitution variables

---

## 🔍 التحقق من الدومين

بعد ما تحط DNS Records:

```bash
# تحقق من DNS
dig hardisk.co +short

# تحقق من SSL
curl -I https://hardisk.co
```

لو شغّال، هتشوف:
```
HTTP/2 200
```

---

## 📊 مراقبة الـ Deployments

### شوف كل الـ Revisions:
```
https://console.cloud.google.com/run/detail/us-central1/mining-club/revisions?project=blockmint-393d2
```

### شوف الـ Logs:
```
https://console.cloud.google.com/logs/query?project=blockmint-393d2
```

---

## 🎯 الخلاصة

بعد الإعداد ده:

✅ **Auto-Deploy**: كل push على `main` → بيروح Cloud Run تلقائياً  
✅ **Domain**: `hardisk.co` → بيفتح تطبيقك مباشرة  
✅ **SSL**: Certificate بيتجدد تلقائياً كل 90 يوم  
✅ **Scaling**: بيعمل scale up/down حسب الـ traffic  

---

## 🆘 حل المشاكل

### Build بيفشل؟
1. تأكد من الـ Substitution variables صح
2. شوف الـ Logs: https://console.cloud.google.com/cloud-build/builds?project=blockmint-393d2

### الدومين مش شغّال؟
1. تأكد إن DNS Records متحطة صح
2. استنى 10-60 دقيقة للـ propagation
3. استخدم https://dnschecker.org للتحقق

### SSL مش شغّال؟
1. تأكد إن DNS propagated خلاص
2. Cloud Run بيأخذ شوية وقت لإصدار Certificate
3. استنى 15-30 دقيقة وجرّب تاني
