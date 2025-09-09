/**
 * Sistema de Debug com Geração de Arquivos TXT
 * Monitora logout, autenticação e erros da aplicação
 */

import { useMemo } from 'react';

interface DebugLog {
  timestamp: string;
  type: 'LOGOUT' | 'AUTH' | 'ERROR' | 'INFO' | 'WARNING';
  action: string;
  details: any;
  userAgent: string;
  url: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.log('INFO', 'Debug Logger Initialized', { sessionId: this.sessionId });
  }

  private generateSessionId(): string {
    return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').replace('Z', '');
  }

  log(type: DebugLog['type'], action: string, details: any = {}, user?: any) {
    const logEntry: DebugLog = {
      timestamp: this.formatTimestamp(),
      type,
      action,
      details: typeof details === 'object' ? details : { message: details },
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.user_metadata?.role || user?.role
    };

    this.logs.push(logEntry);
    
    // Console log com emoji para fácil identificação
    const emoji = {
      'LOGOUT': '🚪',
      'AUTH': '🔐',
      'ERROR': '❌',
      'INFO': 'ℹ️',
      'WARNING': '⚠️'
    }[type];

    console.log(`${emoji} [${type}] ${action}`, details);

    // Auto-save a cada 5 logs ou em caso de erro
    if (this.logs.length % 5 === 0 || type === 'ERROR') {
      this.saveToFile();
    }
  }

  logLogoutAttempt(buttonType: 'dropdown' | 'test', user?: any) {
    this.log('LOGOUT', `Logout Button Clicked - ${buttonType}`, {
      buttonType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      currentPath: window.location.pathname,
      referrer: document.referrer
    }, user);
  }

  logLogoutResult(success: boolean, error?: any, user?: any) {
    this.log(success ? 'LOGOUT' : 'ERROR', 
      success ? 'Logout Successful' : 'Logout Failed', 
      {
        success,
        error: error?.message || error,
        timestamp: Date.now(),
        sessionId: this.sessionId
      }, user);
  }

  logAuthStateChange(event: string, session: any) {
    this.log('AUTH', `Auth State Changed: ${event}`, {
      event,
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.user_metadata?.role,
      timestamp: Date.now()
    });
  }

  logError(error: any, context: string, user?: any) {
    this.log('ERROR', `Error in ${context}`, {
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: Date.now()
    }, user);
  }

  logNavigation(from: string, to: string, user?: any) {
    this.log('INFO', 'Navigation', {
      from,
      to,
      timestamp: Date.now()
    }, user);
  }

  private generateFileName(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `debug_sistema_ministerial_${dateStr}_${timeStr}_${this.sessionId}.txt`;
  }

  private formatLogForFile(log: DebugLog): string {
    const separator = '='.repeat(80);
    return `
${separator}
TIMESTAMP: ${log.timestamp}
TYPE: ${log.type}
ACTION: ${log.action}
URL: ${log.url}
USER: ${log.userEmail || 'Not logged in'} (${log.userRole || 'No role'})
USER ID: ${log.userId || 'N/A'}
USER AGENT: ${log.userAgent}

DETAILS:
${JSON.stringify(log.details, null, 2)}
${separator}
`;
  }

  saveToFile(): void {
    try {
      const fileName = this.generateFileName();
      const header = `
SISTEMA MINISTERIAL - DEBUG LOG
===============================
Session ID: ${this.sessionId}
Generated: ${this.formatTimestamp()}
Total Logs: ${this.logs.length}
URL: ${window.location.href}

SUMMARY:
- Logout attempts: ${this.logs.filter(l => l.action.includes('Logout')).length}
- Errors: ${this.logs.filter(l => l.type === 'ERROR').length}
- Auth events: ${this.logs.filter(l => l.type === 'AUTH').length}

===============================
`;

      const content = header + this.logs.map(log => this.formatLogForFile(log)).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log(`📄 Debug log saved: ${fileName}`);
    } catch (error) {
      console.error('❌ Failed to save debug log:', error);
    }
  }

  // Método para forçar download do log atual
  downloadLog(): void {
    this.log('INFO', 'Manual Log Download Requested');
    this.saveToFile();
  }

  // Método para limpar logs
  clearLogs(): void {
    this.logs = [];
    this.log('INFO', 'Debug Logs Cleared');
  }

  // Método para obter estatísticas
  getStats() {
    return {
      totalLogs: this.logs.length,
      logoutAttempts: this.logs.filter(l => l.action.includes('Logout')).length,
      errors: this.logs.filter(l => l.type === 'ERROR').length,
      authEvents: this.logs.filter(l => l.type === 'AUTH').length,
      sessionId: this.sessionId,
      firstLog: this.logs[0]?.timestamp,
      lastLog: this.logs[this.logs.length - 1]?.timestamp
    };
  }
}

// Instância global do debug logger
export const debugLogger = new DebugLogger();

// Hook para React components
export const useDebugLogger = () => {
  return useMemo(() => ({
    logLogoutAttempt: debugLogger.logLogoutAttempt.bind(debugLogger),
    logLogoutResult: debugLogger.logLogoutResult.bind(debugLogger),
    logAuthStateChange: debugLogger.logAuthStateChange.bind(debugLogger),
    logError: debugLogger.logError.bind(debugLogger),
    logNavigation: debugLogger.logNavigation.bind(debugLogger),
    downloadLog: debugLogger.downloadLog.bind(debugLogger),
    clearLogs: debugLogger.clearLogs.bind(debugLogger),
    getStats: debugLogger.getStats.bind(debugLogger)
  }), []);
};
