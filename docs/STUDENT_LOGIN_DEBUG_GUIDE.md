# Student Login Debug Guide - Sistema Ministerial

## 🎯 Issue Summary

**Problem**: Student Franklin Marcelo Ferreira de Lima successfully authenticates but is not being redirected to his student portal.

**Expected Behavior**: After login → redirect to `/estudante/77c99e53-500b-4140-b7fc-a69f96b216e1`

**Current Status**: Authentication succeeds, but redirect fails

## 🔧 Debugging Changes Implemented

### 1. Enhanced AuthContext Logging ✅

**File**: `src/contexts/AuthContext.tsx`

**Changes Made**:
- Added comprehensive logging to `fetchProfile()` function
- Enhanced auth state change handler with detailed logging
- Fixed loading state management in auth state changes
- Added debugging for profile fetching and role detection

**Debug Output Expected**:
```
🔍 Fetching profile for user ID: 77c99e53-500b-4140-b7fc-a69f96b216e1
✅ Profile fetched successfully: {role: "estudante", nome_completo: "Franklin..."}
🔄 Auth state changed: SIGNED_IN franklinmarceloferreiradelima@gmail.com
👤 Setting user and fetching profile...
📋 Profile set: {role: "estudante", ...}
```

### 2. Enhanced Auth.tsx Redirect Logging ✅

**File**: `src/pages/Auth.tsx`

**Changes Made**:
- Added detailed logging to redirect useEffect
- Shows user, profile, and role state during redirect logic
- Logs the exact redirect URL being used

**Debug Output Expected**:
```
🔀 Auth redirect check: {hasUser: true, hasProfile: true, profileRole: "estudante", ...}
✅ Both user and profile exist, checking role...
👨‍🎓 Redirecting student to portal: /estudante/77c99e53-500b-4140-b7fc-a69f96b216e1
```

### 3. Enhanced ProtectedRoute Logging ✅

**File**: `src/components/ProtectedRoute.tsx`

**Changes Made**:
- Added comprehensive logging to route protection logic
- Shows loading state, user state, profile state, and role checking
- Logs access granted/denied decisions

**Debug Output Expected**:
```
🛡️ ProtectedRoute check: {loading: false, hasUser: true, hasProfile: true, userRole: "estudante", allowedRoles: ["estudante"]}
✅ ProtectedRoute: User and profile loaded, checking role access...
✅ ProtectedRoute: Access granted for role: estudante
```

## 🧪 Testing Tools Created

### 1. Debug HTML Tool ✅

**File**: `scripts/debug-student-redirect.html`

**Purpose**: Browser-based testing tool to simulate the exact login flow

**Usage**:
1. Open the HTML file in a browser
2. Enter Franklin's credentials
3. Click "Test Login Flow"
4. Review detailed logs of each step

**What It Tests**:
- Authentication process
- Profile fetching with RLS
- Role-based logic
- Redirect URL generation
- Session state management

### 2. Node.js Debug Script ✅

**File**: `scripts/test-student-login-debug.js`

**Purpose**: Server-side testing of authentication flow

**Usage**:
```bash
node scripts/test-student-login-debug.js
```

## 🔍 Diagnostic Steps

### Step 1: Check Browser Console

1. Navigate to https://sua-parte.lovable.app/auth
2. Open browser developer tools (F12)
3. Go to Console tab
4. Attempt to login with Franklin's credentials
5. Look for the debug messages listed above

### Step 2: Identify the Failure Point

**Expected Debug Flow**:
```
1. 🔍 Fetching profile for user ID: [user-id]
2. ✅ Profile fetched successfully: [profile-data]
3. 🔄 Auth state changed: SIGNED_IN [email]
4. 👤 Setting user and fetching profile...
5. 📋 Profile set: [profile-data]
6. 🔀 Auth redirect check: [state-data]
7. ✅ Both user and profile exist, checking role...
8. 👨‍🎓 Redirecting student to portal: [url]
9. 🛡️ ProtectedRoute check: [route-data]
10. ✅ ProtectedRoute: Access granted for role: estudante
```

**Common Failure Points**:
- **Profile fetch fails**: Check RLS policies and permissions
- **Role not detected**: Check profile.role value and comparison logic
- **Redirect not triggered**: Check Auth.tsx useEffect dependencies
- **Route blocked**: Check ProtectedRoute allowedRoles configuration

### Step 3: Use Debug Tools

**Browser Tool**:
1. Open `scripts/debug-student-redirect.html`
2. Enter credentials and test
3. Review step-by-step logs

**Console Testing**:
```javascript
// Test profile fetch directly in browser console
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', '77c99e53-500b-4140-b7fc-a69f96b216e1')
  .single();
console.log('Profile:', data, 'Error:', error);
```

## 🎯 Expected Findings

### Likely Root Causes

1. **RLS Policy Issue**: Profile fetch fails due to auth.uid() mismatch
2. **Timing Issue**: Redirect happens before profile is fully loaded
3. **Role Comparison Issue**: String comparison fails due to type mismatch
4. **Route Configuration Issue**: ProtectedRoute blocks access incorrectly

### Database Verification

**Profile Data Confirmed** ✅:
- User ID: `77c99e53-500b-4140-b7fc-a69f96b216e1`
- Role: `"estudante"` (9 characters, no whitespace)
- Profile complete and accessible via service role

**RLS Policies Confirmed** ✅:
- Policy: "Users can view own profile"
- Condition: `auth.uid() = id`
- Should allow user to access their own profile

## 🔧 Potential Fixes

### Fix 1: RLS Policy Issue
```sql
-- If auth.uid() is not working correctly
SELECT auth.uid(); -- Should return user ID when authenticated
```

### Fix 2: Timing Issue
```typescript
// Ensure loading state is properly managed
if (loading || !user || !profile) {
  return; // Wait for all data to load
}
```

### Fix 3: Role Comparison Issue
```typescript
// Ensure exact string comparison
const isEstudante = profile?.role?.toString().trim() === 'estudante';
```

### Fix 4: Route Configuration Issue
```typescript
// Verify allowedRoles array
<ProtectedRoute allowedRoles={['estudante']}>
```

## 📋 Next Steps

1. **Run the debugging session** with browser console open
2. **Identify the exact failure point** using the debug logs
3. **Apply the appropriate fix** based on findings
4. **Test the fix** with the debug tools
5. **Remove debug logging** once issue is resolved

## 📞 Support

If the issue persists after debugging:
1. Capture the complete console log output
2. Note which debug message is the last one shown
3. Check network tab for any failed requests
4. Verify the user's authentication state in Supabase dashboard

---

**Debug Tools Ready**: ✅  
**Logging Enhanced**: ✅  
**Ready for Testing**: ✅
