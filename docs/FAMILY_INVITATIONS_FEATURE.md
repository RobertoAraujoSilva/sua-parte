# 👨‍👩‍👧‍👦 Family Invitations and Registration Feature

## 🎯 Overview

The Family Invitations and Registration feature enables students to register their family members and send invitations for access to the Student Portal. This enhances the assignment algorithm by tracking family relationships and ensures compliance with S-38-T guidelines.

## ✅ Implementation Status

### **Phase 1: Database Setup** ✅ **COMPLETED**
- ✅ **family_members table** created with proper structure
- ✅ **invitations_log table** created for invitation tracking
- ✅ **RLS policies** implemented for data security
- ✅ **Database indexes** created for performance
- ✅ **TypeScript types** updated in Supabase integration

### **Phase 2: Frontend Implementation** ✅ **COMPLETED**
- ✅ **Family types** defined (`src/types/family.ts`)
- ✅ **Custom hook** created (`src/hooks/useFamilyMembers.ts`)
- ✅ **Form component** implemented (`src/components/FamilyMemberForm.tsx`)
- ✅ **List component** implemented (`src/components/FamilyMembersList.tsx`)
- ✅ **Main page** created (`src/pages/estudante/[id]/familia.tsx`)

### **Phase 3: Integration** ✅ **COMPLETED**
- ✅ **Routing** configured in App.tsx
- ✅ **Navigation** added to Student Portal
- ✅ **Build verification** passed successfully

### **Phase 4: Pending Implementation** 🔄 **NEXT STEPS**
- ⏳ **Email template** configuration in Supabase Auth
- ⏳ **Invitation acceptance** flow implementation
- ⏳ **Assignment algorithm** integration
- ⏳ **WhatsApp integration** for invitations

## 🗄️ Database Schema

### **family_members Table**
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('M', 'F')) NOT NULL,
  relation TEXT CHECK (relation IN ('Pai','Mãe','Cônjuge','Filho','Filha','Irmão','Irmã')) NOT NULL,
  invitation_status TEXT DEFAULT 'PENDING' CHECK (invitation_status IN ('PENDING','SENT','ACCEPTED','EXPIRED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **invitations_log Table**
```sql
CREATE TABLE invitations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  sent_by_student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_method TEXT CHECK (invite_method IN ('EMAIL','WHATSAPP')) NOT NULL,
  invite_status TEXT DEFAULT 'SENT' CHECK (invite_status IN ('SENT','ACCEPTED','EXPIRED')),
  invitation_token UUID DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Implementation

### **Row Level Security (RLS)**
- ✅ **family_members**: Users can only access their own family members
- ✅ **invitations_log**: Users can only access their own invitations
- ✅ **Proper foreign key** relationships with CASCADE deletion

### **Access Control**
- ✅ **Students**: Can manage their own family members
- ✅ **Instructors**: Can view/manage any student's family (for administrative purposes)
- ✅ **Route protection**: Implemented in React Router

## 🎨 User Interface

### **Family Management Page** (`/estudante/[id]/familia`)
- ✅ **Tabbed interface**: List view and Add/Edit forms
- ✅ **Responsive design**: Works on desktop and mobile
- ✅ **Form validation**: Comprehensive validation with Zod
- ✅ **Status indicators**: Visual invitation status tracking

### **Family Member Form**
- ✅ **Required fields**: Name, gender, relationship
- ✅ **Optional contact**: Email and/or phone (at least one required for invitations)
- ✅ **Auto-gender selection**: Based on relationship choice
- ✅ **Brazilian phone formatting**: Automatic formatting and validation

### **Family Members List**
- ✅ **Card layout**: Clean, organized display
- ✅ **Action menus**: Edit, delete, send invitations
- ✅ **Status badges**: Visual invitation status indicators
- ✅ **Quick actions**: One-click invitation sending

## 🔧 Technical Implementation

### **Key Components**
1. **`useFamilyMembers` Hook**: Data management with React Query
2. **`FamilyMemberForm`**: Form with validation and auto-formatting
3. **`FamilyMembersList`**: Display and action management
4. **`FamiliaPage`**: Main page with tab navigation

### **Validation & Formatting**
- ✅ **Zod schemas**: Type-safe validation
- ✅ **Brazilian phone**: Automatic formatting `(XX) XXXXX-XXXX`
- ✅ **Email validation**: Standard email format checking
- ✅ **Required contact**: At least email OR phone must be provided

### **State Management**
- ✅ **React Query**: Server state management with caching
- ✅ **Optimistic updates**: Immediate UI feedback
- ✅ **Error handling**: Comprehensive error states
- ✅ **Loading states**: User feedback during operations

## 🚀 Usage Flow

### **For Students**
1. **Access**: Navigate to "Gerenciar Família" from Student Portal
2. **Add Family**: Fill out family member form with contact info
3. **Send Invitations**: Click to send email or WhatsApp invitations
4. **Track Status**: Monitor invitation acceptance status
5. **Manage**: Edit or remove family members as needed

### **For Family Members** (Future Implementation)
1. **Receive Invitation**: Via email or WhatsApp
2. **Accept Invitation**: Click link to create account
3. **Access Portal**: View student's assignments (read-only)

## 📋 Next Implementation Steps

### **1. Email Template Configuration**
```html
<!-- Configure in Supabase > Authentication > Templates -->
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h1>Sistema Ministerial - Convite</h1>
  <p>{{ .InvitedByName }} convidou você para acessar o Portal do Estudante</p>
  <a href="{{ .ConfirmationURL }}">Ativar Conta</a>
</div>
```

### **2. Invitation Acceptance Flow**
- Create invitation acceptance page
- Implement automatic account creation
- Set up read-only access for family members

### **3. Assignment Algorithm Integration**
- Query family relationships in assignment generation
- Implement family pairing rules
- Prevent non-family male-female pairs

### **4. WhatsApp Integration**
- Integrate with WhatsApp Business API
- Create message templates
- Handle delivery status

## 🧪 Testing Checklist

### **Database Testing**
- ✅ **Table creation**: Verified successful creation
- ✅ **RLS policies**: Tested access restrictions
- ✅ **Foreign keys**: Verified cascade deletion

### **Frontend Testing**
- ✅ **Build process**: Successful compilation
- ✅ **TypeScript**: No type errors
- ✅ **Component rendering**: All components load correctly

### **Integration Testing** (Pending)
- ⏳ **Form submission**: Test family member creation
- ⏳ **Invitation sending**: Test email/WhatsApp invitations
- ⏳ **Status updates**: Test invitation status tracking
- ⏳ **Access control**: Test permission restrictions

## 📊 Benefits

### **For Assignment Algorithm**
- **Family awareness**: Understands family relationships
- **S-38-T compliance**: Follows JW guidelines for pairing
- **Better assignments**: More appropriate student pairings

### **For Students**
- **Family inclusion**: Family members can access portal
- **Better experience**: More relevant assignments
- **Easy management**: Simple family member registration

### **For Instructors**
- **Better oversight**: Understanding of family dynamics
- **Improved assignments**: More appropriate pairings
- **Administrative control**: Can manage family relationships

## 🎯 Success Metrics

- ✅ **Database**: Tables created and secured
- ✅ **Frontend**: Components built and integrated
- ✅ **Build**: Successful compilation without errors
- ⏳ **Functionality**: End-to-end testing pending
- ⏳ **User Adoption**: Student usage metrics pending

---

**Status**: ✅ **CORE IMPLEMENTATION COMPLETE**  
**Next Phase**: 🔄 **Email Templates & Invitation Flow**  
**Ready for**: 🧪 **User Testing & Feedback**
