# دليل ربط الدومين hardisk.co بـ Cloud Run

## 🎯 الـ DNS Records المطلوبة

### A Records (IPv4) - **إلزامية**
```
Type: A
Name: @ (أو hardisk.co)
Value: 216.239.32.21
TTL: Auto أو 3600

Type: A
Name: @ (أو hardisk.co)
Value: 216.239.34.21
TTL: Auto أو 3600

Type: A
Name: @ (أو hardisk.co)
Value: 216.239.36.21
TTL: Auto أو 3600

Type: A
Name: @ (أو hardisk.co)
Value: 216.239.38.21
TTL: Auto أو 3600
```

### AAAA Records (IPv6) - **اختيارية (موصى بها)**
```
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

---

## 📝 الخطوات حسب مسجّل الدومين

### 🔷 Namecheap

1. سجّل دخول على [namecheap.com](https://www.namecheap.com)
2. روح **Domain List** → اضغط **Manage** جنب `hardisk.co`
3. روح تبويب **Advanced DNS**
4. **احذف أي A Records قديمة** (زي Parking Page)
5. اضغط **Add New Record** لكل IP:

```
Type: A Record
Host: @
Value: 216.239.32.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.34.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.36.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.38.21
TTL: Automatic
```

6. (اختياري) لو عايز `www.hardisk.co` يشتغل كمان:
```
Type: CNAME Record
Host: www
Value: hardisk.co.
TTL: Automatic
```

7. اضغط **Save All Changes**

---

### 🔶 GoDaddy

1. سجّل دخول على [godaddy.com](https://www.godaddy.com)
2. روح **My Products** → **Domains** → اضغط على `hardisk.co`
3. اضغط **DNS** أو **Manage DNS**
4. **احذف أي A Records قديمة** (Parked domain)
5. اضغط **Add** لكل IP:

```
Type: A
Name: @
Value: 216.239.32.21
TTL: 1 Hour (أو Default)

Type: A
Name: @
Value: 216.239.34.21
TTL: 1 Hour

Type: A
Name: @
Value: 216.239.36.21
TTL: 1 Hour

Type: A
Name: @
Value: 216.239.38.21
TTL: 1 Hour
```

6. اضغط **Save**

---

### ☁️ Cloudflare

1. سجّل دخول على [dash.cloudflare.com](https://dash.cloudflare.com)
2. اختار `hardisk.co`
3. روح **DNS** → **Records**
4. **احذف أي A Records قديمة**
5. اضغط **Add record** لكل IP:

```
Type: A
Name: @ (أو hardisk.co)
IPv4 address: 216.239.32.21
Proxy status: DNS only (سحابة رمادية 🌐 مش برتقالية ☁️)
TTL: Auto

Type: A
Name: @
IPv4 address: 216.239.34.21
Proxy status: DNS only
TTL: Auto

Type: A
Name: @
IPv4 address: 216.239.36.21
Proxy status: DNS only
TTL: Auto

Type: A
Name: @
IPv4 address: 216.239.38.21
Proxy status: DNS only
TTL: Auto
```

**⚠️ مهم جداً**: تأكد إن Proxy status على **DNS only** (سحابة رمادية)، مش Proxied، عشان SSL بتاع Google يشتغل صح.

6. اضغط **Save**

---

### 🌍 مسجّلين تانيين (عام)

أي control panel للدومين:

1. دوّر على **DNS Management** أو **DNS Records** أو **Advanced DNS**
2. احذف أي **A Records** قديمة
3. ضيف **4 A Records** بالقيم دي:
   - `216.239.32.21`
   - `216.239.34.21`
   - `216.239.36.21`
   - `216.239.38.21`
4. الـ **Host/Name** يكون `@` أو فاضي أو `hardisk.co`
5. **TTL**: سيبه Auto أو حط 3600
6. Save

---

## ✅ التحقق من الإعداد

### بعد ما تحط DNS Records (استنى 10-30 دقيقة):

```bash
# 1. تحقق من DNS propagation
dig hardisk.co +short

# المفروض تشوف الـ 4 IPs:
# 216.239.32.21
# 216.239.34.21
# 216.239.36.21
# 216.239.38.21

# 2. تحقق من الدومين على النت
curl -I https://hardisk.co
# لو شغّال: HTTP/2 200

# 3. أو افتح في المتصفح
https://hardisk.co
```

### أدوات التحقق Online:

- **DNS Checker**: https://dnschecker.org/#A/hardisk.co
- **What's My DNS**: https://www.whatsmydns.net/#A/hardisk.co
- **Google DNS**: https://dns.google/query?name=hardisk.co&type=A

---

## ⏱️ كم من الوقت؟

| الخطوة | الوقت |
|--------|-------|
| حط DNS Records | 2-5 دقايق |
| DNS Propagation | 10-60 دقيقة |
| SSL Certificate | 10-30 دقيقة (بعد DNS) |
| **الإجمالي** | **20 دقيقة - ساعة ونص** |

---

## 🔐 شهادة SSL

Google Cloud Run بتصدر شهادة SSL تلقائياً من **Let's Encrypt** بعد ما DNS يبقى شغّال.

**مش محتاج تعمل حاجة!** فقط استنى وهتلاقي:
- ✅ `https://hardisk.co` شغّال
- ✅ القفل الأخضر في المتصفح 🔒
- ✅ الشهادة بتتجدّد تلقائياً كل 90 يوم

---

## 🆘 حل المشاكل

### ❌ الدومين مش بيفتح؟

**تحقق من DNS أولاً**:
```bash
dig hardisk.co +short
```

**لو مفيش نتيجة** أو **IPs غلط**:
- تأكد إنك حطيت الـ 4 IPs صح
- احذف أي A Records قديمة
- استنى 10-30 دقيقة تانية

**لو IPs صح بس الموقع مش شغّال**:
- جرّب `http://hardisk.co` (بدون s)
- لو اشتغل يبقى SSL لسه بيتجهّز

### ❌ SSL Certificate مش شغّال؟

**السبب**: DNS لسه بيتحدّث أو Cloud Run mapping مش معمول

**الحل**:
1. تأكد إن DNS propagated (استخدم dns.google)
2. تأكد إنك عملت Domain Mapping في Cloud Run Console:
   ```
   https://console.cloud.google.com/run/detail/us-central1/mining-club?project=blockmint-393d2&tab=domain-mappings
   ```
3. اضغط **ADD MAPPING** وحط `hardisk.co`
4. استنى 15-30 دقيقة

### ❌ www.hardisk.co مش شغّال؟

**الحل**: ضيف CNAME Record:
```
Type: CNAME
Name: www
Value: hardisk.co.
TTL: Auto
```

(لاحظ النقطة `.` في الآخر)

---

## 📊 ملخص الإعدادات

```
Domain: hardisk.co
Records Type: A (IPv4)
IPs Count: 4
SSL: Automatic (Let's Encrypt)
Renewal: Automatic every 90 days
CDN: Integrated with Cloud Run
```

---

## 🎯 الخطوة التالية

بعد ما الدومين يشتغل:
- ✅ فعّل Auto-Deploy من GitHub → [شوف DOMAIN_AUTODEPLOY_SETUP.md](DOMAIN_AUTODEPLOY_SETUP.md)
- ✅ راقب الـ traffic → [Cloud Run Metrics](https://console.cloud.google.com/run/detail/us-central1/mining-club/metrics?project=blockmint-393d2)
- ✅ شوف الـ logs → [Cloud Logging](https://console.cloud.google.com/logs/query?project=blockmint-393d2)
