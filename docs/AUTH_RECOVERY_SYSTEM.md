# Authentication Recovery System

## Overview

The Authentication Recovery System is a comprehensive solution designed to automatically detect and recover from corrupted authentication states in the Sistema Ministerial application. This system eliminates the need for manual browser data clearing and provides automatic recovery mechanisms.

## Problem Solved

**Before**: Users experienced persistent loading states ("Carregando Dashboard") that required manual clearing of browser site data through Chrome DevTools to resolve.

**After**: Automatic detection and recovery from authentication corruption with multiple fallback mechanisms.

## Components

### 1. Authentication Recovery (`src/utils/authRecovery.ts`)

**Core Functions:**
- `detectAuthCorruption()` - Detects if authentication state is corrupted
- `recoverAuthentication()` - Attempts to recover from corruption
- `clearAuthStorage()` - Cleans all authentication-related storage
- `initializeAuthRecovery()` - Automatic recovery system initialization

**Features:**
- Timeout-based corruption detection (5-second database query timeout)
- Session refresh attempts before clearing storage
- Cooldown mechanism to prevent infinite recovery loops
- Maximum retry limits with automatic fallback to storage clearing

### 2. Session Health Check (`src/utils/sessionHealthCheck.ts`)

**Core Functions:**
- `performHealthCheck()` - Comprehensive system health analysis
- `quickHealthCheck()` - Fast health verification

**Health Checks:**
- **Session Health**: Validates active session and expiry times
- **Database Connectivity**: Tests basic database queries with timeout
- **Profile Loading**: Verifies user profile can be loaded
- **Essential Tables**: Checks existence of critical database tables

**Results:**
- Overall status: `healthy` | `warning` | `critical`
- Detailed check results with timing information
- Actionable recommendations for resolving issues

### 3. Enhanced AuthContext (`src/contexts/AuthContext.tsx`)

**Improvements:**
- Profile loading with 8-second timeout
- Automatic recovery trigger on timeout
- Better error handling for table not found scenarios
- Integration with recovery system

### 4. Admin Dashboard Integration (`src/pages/AdminGlobalDashboard.tsx`)

**Features:**
- 15-second loading timeout with automatic recovery
- Visual feedback for timeout states
- Manual recovery buttons
- Health check integration
- Auto-recovery status indicators

## How It Works

### Automatic Recovery Flow

1. **Initialization** (3 seconds after app start):
   ```typescript
   initializeAuthRecovery() → detectAuthCorruption() → recoverAuthentication()
   ```

2. **Loading Timeout Detection** (15 seconds):
   ```typescript
   Dashboard Loading → Timeout → detectAuthCorruption() → recoverAuthentication()
   ```

3. **Profile Loading Timeout** (8 seconds):
   ```typescript
   loadProfile() → Timeout → detectAuthCorruption() → recoverAuthentication()
   ```

### Recovery Actions

1. **Session Refresh**: Attempts to refresh the current session
2. **Storage Clearing**: Removes all authentication-related data
3. **Redirect**: Sends user to login page after clearing

### Manual Tools

Available in browser console for debugging:

```javascript
// Authentication recovery tools
window.authRecovery.detect()    // Check for corruption
window.authRecovery.recover()   // Attempt recovery
window.authRecovery.clear()     // Clear storage
window.authRecovery.initialize() // Run full initialization

// Health check tools
window.healthCheck.full()       // Comprehensive health check
window.healthCheck.quick()      // Quick session check
```

## User Interface

### Loading Screen Enhancements

- **Normal State**: "Carregando dados da programação global..."
- **Timeout State**: "Carregamento demorado detectado - verificando autenticação..."
- **Auto-Recovery**: "Recuperação automática em andamento..."

### Recovery Buttons

1. **🔄 Recuperar Autenticação**: Manual recovery trigger
2. **🏥 Verificar Saúde do Sistema**: Comprehensive health check
3. **Criar Tabelas**: Database setup (existing)
4. **Corrigir Perfil Admin**: Profile fix (existing)

## Configuration

### Timeouts
- **Profile Loading**: 8 seconds
- **Dashboard Loading**: 15 seconds
- **Database Queries**: 5 seconds
- **Recovery Cooldown**: 30 seconds

### Retry Limits
- **Maximum Recovery Attempts**: 3
- **Session Refresh Timeout**: 3 seconds

## Monitoring and Debugging

### Console Logging

All recovery actions are logged with emojis for easy identification:

- 🔍 Detection activities
- 🔄 Recovery attempts
- ✅ Successful operations
- ❌ Errors and failures
- ⚠️ Warnings
- 🧹 Storage clearing
- 🏥 Health checks

### Health Check Results

```typescript
interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical';
  checks: {
    session: HealthCheck;
    database: HealthCheck;
    profile: HealthCheck;
    tables: HealthCheck;
  };
  recommendations: string[];
  timestamp: Date;
}
```

## Troubleshooting

### Common Issues

1. **Still Getting Loading Screen**:
   - Wait 15 seconds for auto-recovery
   - Click "🔄 Recuperar Autenticação"
   - Check browser console for error messages

2. **Health Check Shows Critical**:
   - Follow the recommendations provided
   - Run "Criar Tabelas" if tables are missing
   - Run "Corrigir Perfil Admin" if profile issues exist

3. **Recovery Not Working**:
   - Check browser console for errors
   - Try manual storage clearing: `window.authRecovery.clear()`
   - Restart browser if needed

### Manual Recovery Steps

If automatic recovery fails:

1. Open browser console (F12)
2. Run: `window.authRecovery.clear()`
3. Navigate to `/auth` to login again
4. If still failing, clear browser data manually

## Implementation Notes

- Recovery system is only active in development mode
- All utilities are exposed on `window` object for debugging
- System respects cooldown periods to prevent infinite loops
- Automatic redirects preserve user workflow
- Health checks provide actionable feedback

## Future Enhancements

- Real-time health monitoring dashboard
- Email notifications for critical issues
- Automatic retry with exponential backoff
- Integration with error reporting services
- User-friendly recovery UI instead of console tools
