# SPEC: Deployment Checklist
**File:** `docs/specs/DEPLOYMENT.md`  
**Status:** Active

---

## Vercel Setup Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial project scaffold"
git remote add origin https://github.com/YOUR_USERNAME/toolforge.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `/` (default)
5. Click **Deploy**

### Step 3: Set Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_SITE_URL          = https://your-domain.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID = ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADS_ENABLED       = false
```

### Step 4: Custom Domain (Optional)
1. Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records per Vercel instructions
4. Update `NEXT_PUBLIC_SITE_URL` to custom domain

### Step 5: Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → URL prefix → your domain
3. Verify via HTML tag (add to `layout.tsx` metadata)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### Step 6: Google Analytics 4
1. Go to https://analytics.google.com
2. Create property → Web stream
3. Copy Measurement ID (G-XXXXXXXXXX)
4. Add to Vercel environment variables

---

## Pre-Launch Checklist

### Technical
- [ ] All pages load without errors
- [ ] Sitemap accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt
- [ ] No 404 errors on tool pages
- [ ] Mobile responsive (test at 375px)
- [ ] Core Web Vitals: all green (use PageSpeed Insights)
- [ ] HTTPS enabled (automatic on Vercel)

### SEO
- [ ] Each tool page has unique title + description
- [ ] Canonical URLs set on all pages
- [ ] JSON-LD schema on all tool pages
- [ ] OG images set (at minimum default OG image)
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google

### Ads
- [ ] NEXT_PUBLIC_ADS_ENABLED=false until approved
- [ ] Ad placeholder components render correctly
- [ ] After AdSense approval: set to true + add client ID
- [ ] After Adsterra approval: add keys + set to true

### Analytics
- [ ] GA4 tracking firing on page views
- [ ] Test in GA4 Realtime report

---

## Post-Launch Monitoring

### Week 1
- Monitor Vercel deployment logs
- Check Google Search Console for crawl errors
- Verify GA4 is tracking

### Month 1
- Apply for Adsterra (immediate)
- Submit to Google Search Console
- Check Core Web Vitals report

### Month 3
- Apply for Google AdSense
- Review top-performing tools by traffic
- Add more tools in high-traffic categories
