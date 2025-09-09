# Supabase Authentication URL Configuration

## 🎯 Overview

This document outlines the Supabase authentication URL configuration for the Sistema Ministerial project, ensuring proper authentication flow in both development and production environments.

## 🔧 Configuration Changes Made

### 1. Site URL Update

**Previous Configuration:**
```
Site URL: http://localhost:3000
```

**Updated Configuration:**
```
Site URL: https://sua-parte.lovable.app
```

**Reason:** Updated to use the new primary production domain for Sistema Ministerial.

### 2. Redirect URLs Configuration

**Current Redirect URLs:**
```
http://localhost:5173/**                                    (Local Development)
https://sua-parte.lovable.app/**                           (Primary Production)
```

**Changes Made:**
- ✅ Added `http://localhost:5173/**` for local development
- ✅ Updated to `https://sua-parte.lovable.app/**` as primary production URL
- ✅ Removed legacy URLs for improved security and clarity

### 3. Email Template Updates

**Enhanced Email Templates with Sistema Ministerial Branding:**

- **Confirmation Email:** "Sistema Ministerial - Confirme seu cadastro"
- **Email Change:** "Sistema Ministerial - Confirme a alteração de e-mail"
- **Invite Email:** "Sistema Ministerial - Você foi convidado"
- **Magic Link:** "Sistema Ministerial - Link de acesso"
- **Password Recovery:** "Sistema Ministerial - Redefinir senha"

**Template Features:**
- Professional HTML design with Sistema Ministerial branding
- Consistent color scheme (JW Navy Blue: #1e3a8a)
- Portuguese language content
- Clear call-to-action buttons
- Responsive design for mobile devices
- Fallback text links for accessibility

## ✅ Verification Results

**Test Results** (from `scripts/test-url-configuration.js`):
- ✅ Connection Test: PASS
- ✅ Redirect URL Test: PASS  
- ✅ Registration Flow Test: PASS
- ⚠️ Site URL Test: Expected (client-side limitation)

**Key Success Metrics:**
- Authentication endpoints responding correctly
- New user registration working with auto-confirmation
- Immediate login after registration successful
- Supabase client properly configured

## 🌐 Environment Support

### Development Environment
- **URL:** `http://localhost:5173`
- **Port:** 5173 (Vite default)
- **Authentication:** Fully functional
- **Email Confirmation:** Auto-confirmed (no SMTP required)

### Production Environment
- **Primary:** `https://sua-parte.lovable.app`
- **Authentication:** Ready for deployment
- **Email Templates:** Use production domain for all links
- **Security:** Optimized with minimal redirect URLs

## 📋 Configuration Summary

| Setting | Previous Value | New Value | Status |
|---------|---------------|-----------|---------|
| Site URL | `http://localhost:5173` | `https://sua-parte.lovable.app` | ✅ Updated |
| Local Redirect | `http://localhost:5173/**` | `http://localhost:5173/**` | ✅ Maintained |
| Production URLs | Multiple legacy URLs | `https://sua-parte.lovable.app/**` | ✅ Simplified |
| Email Templates | Sistema Ministerial branded | Sistema Ministerial branded | ✅ Maintained |
| Auto-confirm | Enabled | Enabled | ✅ Maintained |

## 🚀 Usage Instructions

### For Local Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   ```
   http://localhost:5173
   ```

3. **Test authentication:**
   - Navigate to `/auth`
   - Register a new account
   - Login immediately (no email confirmation required)

### For Production Deployment

1. **Deploy via Lovable:**
   - Open the Lovable project
   - Click Share → Publish
   - URLs will automatically work with configured redirects

2. **Production Domain:**
   - Access via `https://sua-parte.lovable.app`
   - All authentication flows supported

## 🔍 Troubleshooting

### Common Issues

**Issue:** "Invalid redirect URL" error
**Solution:** 
- Verify the URL is in the redirect list
- Check for typos in the URL
- Ensure protocol (http/https) matches

**Issue:** Authentication not working in development
**Solution:**
- Confirm development server is running on port 5173
- Check that `http://localhost:5173/**` is in redirect URLs
- Verify Site URL is set to `http://localhost:5173`

**Issue:** Email templates not displaying correctly
**Solution:**
- Templates are HTML-based and should render properly
- Check email client compatibility
- Verify template variables are populated

### Verification Commands

**Test URL configuration:**
```bash
node scripts/test-url-configuration.js
```

**Test production URL configuration:**
```bash
node scripts/test-production-url-config.js
```

**Test authentication flow:**
```bash
node scripts/test-auth-fix.js
```

## 📞 Support

For URL configuration issues:
1. Check the troubleshooting guide above
2. Verify Supabase dashboard settings match this documentation
3. Test with the provided verification scripts
4. Contact development team with specific error messages

## 🔗 Related Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/nwpuurgwnnuejqinkvrh
- **URL Configuration:** https://supabase.com/dashboard/project/nwpuurgwnnuejqinkvrh/auth/url-configuration
- **Email Templates:** https://supabase.com/dashboard/project/nwpuurgwnnuejqinkvrh/auth/templates
- **Lovable Project:** https://lovable.dev/projects/1f603510-088b-48b6-84e2-6c4dadb2fe65

---

**Last Updated:** August 6, 2025  
**Status:** ✅ CONFIGURED  
**Environment:** Development & Production Ready
