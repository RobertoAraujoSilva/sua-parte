# 📧 Supabase Email Template Configuration

## Configuration Steps

### **1. Navigate to Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **emtdatabase** (ID: nwpuurgwnnuejqinkvrh)
3. Navigate to **Authentication > Email Templates**
4. Select **"Invite user"** template

### **2. Email Template Configuration**

#### **Subject Line**
```
Convite para acessar o Sistema Ministerial
```

#### **HTML Body Template**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Sistema Ministerial</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">
      Você foi convidado para acessar o Portal do Estudante
    </p>
  </div>
  <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1e3a8a; margin-top: 0;">Ative seu acesso</h2>
    <p style="color: #374151; line-height: 1.6;">
      Você foi convidado(a) para acessar o Sistema Ministerial e acompanhar as designações da Escola do Ministério Teocrático.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ativar Conta</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">
      Se não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
      <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
    </p>
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;">
    <p style="color:#6b7280;font-size:12px;text-align:center;">
      Este convite é válido por 48 horas. Após este período, será necessário solicitar um novo convite.
    </p>
  </div>
</div>
```

### **3. Available Supabase Variables**
- `{{ .ConfirmationURL }}` - The invitation acceptance URL
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - The invited user's email
- `{{ .Token }}` - The invitation token

### **4. Redirect URL Configuration**
In **Authentication > URL Configuration**, set:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: Add `https://your-domain.com/convite/aceitar`

### **5. Testing the Template**
After configuration, test by:
1. Using the invitation system in the Family Management feature
2. Checking email delivery in the invited user's inbox
3. Verifying the email formatting and links work correctly

---

**Note**: Replace `https://your-domain.com` with your actual domain when deploying to production.
