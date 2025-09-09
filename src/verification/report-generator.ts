// Enhanced report generator with storage integration

import { ReportGenerator } from './interfaces';
import { 
  VerificationResult, 
  VerificationReport, 
  VerificationSummary, 
  OverallStatus, 
  Recommendation,
  ErrorSeverity 
} from './types';
import { 
  ReportStorageManager, 
  StoredReport, 
  ReportMetadata, 
  ExportOptions,
  HistoricalTrend,
  ComparisonResult
} from './report-storage';

export interface ReportGeneratorOptions {
  includeDetailedErrors?: boolean;
  includeRecommendations?: boolean;
  includeHistoricalData?: boolean;
  generateCharts?: boolean;
  autoStore?: boolean;
  metadata?: Partial<ReportMetadata>;
}

export class EnhancedReportGenerator implements ReportGenerator {
  private storage: ReportStorageManager;

  constructor(storage?: ReportStorageManager) {
    this.storage = storage || new ReportStorageManager();
  }

  /**
   * Initialize the report generator and storage
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    console.log('📊 Enhanced report generator initialized');
  }

  /**
   * Generate comprehensive verification report
   */
  async generateReport(
    results: VerificationResult[], 
    options: ReportGeneratorOptions = {}
  ): Promise<VerificationReport> {
    try {
      console.log('📋 Generating comprehensive verification report...');
      
      const timestamp = new Date();
      const summary = this.calculateSummary(results);
      const overallStatus = this.determineOverallStatus(summary, results);
      const recommendations = options.includeRecommendations !== false 
        ? await this.generateRecommendations(results) 
        : [];

      // Calculate total duration
      const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);

      const report: VerificationReport = {
        overallStatus,
        timestamp,
        totalDuration,
        summary,
        moduleResults: results,
        recommendations
      };

      // Auto-store if enabled
      if (options.autoStore !== false) {
        await this.storeReport(report, options.metadata);
      }

      console.log(`✅ Report generated successfully - Status: ${overallStatus}`);
      return report;

    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Store report with metadata
   */
  async storeReport(
    report: VerificationReport, 
    metadata: Partial<ReportMetadata> = {}
  ): Promise<StoredReport> {
    return await this.storage.storeReport(report, metadata);
  }

  /**
   * Save report to file (legacy interface)
   */
  async saveReport(report: VerificationReport, filePath: string): Promise<void> {
    const storedReport = await this.storeReport(report);
    
    // Export to specified path
    await this.storage.exportReport(storedReport.id, { format: 'json' }, filePath);
    
    console.log(`💾 Report saved to: ${filePath}`);
  }

  /**
   * Generate summary text
   */
  async generateSummary(results: VerificationResult[]): Promise<string> {
    const summary = this.calculateSummary(results);
    const overallStatus = this.determineOverallStatus(summary, results);
    
    const lines: string[] = [];
    lines.push('='.repeat(60));
    lines.push('SISTEMA MINISTERIAL VERIFICATION SUMMARY');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Overall Status: ${overallStatus}`);
    lines.push(`Timestamp: ${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('Test Results:');
    lines.push(`  Total Tests: ${summary.totalTests}`);
    lines.push(`  Passed: ${summary.passed} (${this.calculatePercentage(summary.passed, summary.totalTests)}%)`);
    lines.push(`  Failed: ${summary.failed} (${this.calculatePercentage(summary.failed, summary.totalTests)}%)`);
    lines.push(`  Warnings: ${summary.warnings} (${this.calculatePercentage(summary.warnings, summary.totalTests)}%)`);
    lines.push(`  Critical Issues: ${summary.criticalIssues}`);
    lines.push('');
    
    // Module breakdown
    lines.push('Module Results:');
    results.forEach(result => {
      const statusIcon = this.getStatusIcon(result.status);
      lines.push(`  ${statusIcon} ${result.module}: ${result.status} (${result.duration}ms)`);
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          lines.push(`    ❌ ${error.message}`);
        });
      }
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          lines.push(`    ⚠️ ${warning.message}`);
        });
      }
    });
    
    lines.push('');
    lines.push('='.repeat(60));
    
    return lines.join('\n');
  }

  /**
   * Generate report with historical comparison
   */
  async generateHistoricalReport(
    results: VerificationResult[],
    options: ReportGeneratorOptions = {}
  ): Promise<{
    report: VerificationReport;
    trends: HistoricalTrend[];
    comparison?: ComparisonResult;
  }> {
    const report = await this.generateReport(results, options);
    const trends = await this.storage.generateTrendAnalysis(30);
    
    // Get previous report for comparison
    const recentReports = await this.storage.getAllReports(2);
    let comparison: ComparisonResult | undefined;
    
    if (recentReports.length >= 2) {
      comparison = await this.storage.compareReports(
        recentReports[0].id,
        recentReports[1].id
      ) || undefined;
    }

    return {
      report,
      trends,
      comparison
    };
  }

  /**
   * Export stored report in multiple formats
   */
  async exportStoredReport(
    reportId: string,
    format: 'json' | 'html' | 'pdf',
    outputPath?: string,
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    const exportOptions: ExportOptions = {
      format,
      includeHistory: true,
      includeCharts: true,
      ...options
    };

    return await this.storage.exportReport(reportId, exportOptions, outputPath);
  }

  /**
   * Get all stored reports
   */
  async getStoredReports(limit?: number): Promise<StoredReport[]> {
    return await this.storage.getAllReports(limit);
  }

  /**
   * Get specific stored report
   */
  async getStoredReport(reportId: string): Promise<StoredReport | null> {
    return await this.storage.getReport(reportId);
  }

  /**
   * Generate trend analysis
   */
  async generateTrendAnalysis(days: number = 30): Promise<HistoricalTrend[]> {
    return await this.storage.generateTrendAnalysis(days);
  }

  /**
   * Compare two reports
   */
  async compareReports(currentId: string, previousId: string): Promise<ComparisonResult | null> {
    return await this.storage.compareReports(currentId, previousId);
  }

  /**
   * Generate dashboard data for monitoring
   */
  async generateDashboardData(): Promise<{
    latestReport: StoredReport | null;
    trends: HistoricalTrend[];
    recentReports: StoredReport[];
    systemHealth: {
      status: OverallStatus;
      uptime: number;
      lastCheck: Date;
      criticalIssues: number;
    };
  }> {
    const recentReports = await this.storage.getAllReports(10);
    const latestReport = recentReports.length > 0 ? recentReports[0] : null;
    const trends = await this.storage.generateTrendAnalysis(7);

    const systemHealth = {
      status: latestReport?.report.overallStatus || 'ISSUES_FOUND' as OverallStatus,
      uptime: latestReport ? Date.now() - latestReport.timestamp.getTime() : 0,
      lastCheck: latestReport?.timestamp || new Date(),
      criticalIssues: latestReport?.report.summary.criticalIssues || 0
    };

    return {
      latestReport,
      trends,
      recentReports,
      systemHealth
    };
  }

  /**
   * Cleanup old reports
   */
  async cleanupOldReports(): Promise<void> {
    await this.storage.cleanupOldReports();
  }

  // Private helper methods

  private calculateSummary(results: VerificationResult[]): VerificationSummary {
    const summary: VerificationSummary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      criticalIssues: 0
    };

    results.forEach(result => {
      summary.totalTests += result.details.length;
      
      result.details.forEach(detail => {
        switch (detail.result) {
          case 'PASS':
            summary.passed++;
            break;
          case 'FAIL':
            summary.failed++;
            break;
          case 'WARNING':
            summary.warnings++;
            break;
        }
      });

      // Count critical issues (modules with errors)
      if (result.errors && result.errors.length > 0) {
        summary.criticalIssues++;
      }
    });

    return summary;
  }

  private determineOverallStatus(
    summary: VerificationSummary, 
    results: VerificationResult[]
  ): OverallStatus {
    // Check for critical failures (modules that couldn't run)
    const criticalFailures = results.filter(r => 
      r.status === 'FAIL' && (r.errors && r.errors.length > 0)
    );

    if (criticalFailures.length > 0) {
      return 'CRITICAL_FAILURES';
    }

    // Check for any failures or warnings
    if (summary.failed > 0 || summary.warnings > 0) {
      return 'ISSUES_FOUND';
    }

    return 'HEALTHY';
  }

  private async generateRecommendations(results: VerificationResult[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    results.forEach(result => {
      // Generate recommendations for failed modules
      if (result.status === 'FAIL') {
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => {
            recommendations.push({
              severity: 'HIGH',
              component: result.module,
              issue: `Module failure: ${error.message}`,
              solution: this.getSolutionForError(result.module, error.message),
              documentation: this.getDocumentationLink(result.module)
            });
          });
        } else {
          recommendations.push({
            severity: 'MEDIUM',
            component: result.module,
            issue: 'Module reported failure status without specific errors',
            solution: 'Review module logs and check for configuration issues',
            documentation: this.getDocumentationLink(result.module)
          });
        }
      }

      // Generate recommendations for warnings
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          recommendations.push({
            severity: 'LOW',
            component: result.module,
            issue: warning.message || 'Warning detected',
            solution: 'Review the warning details and consider addressing to improve system reliability',
            documentation: this.getDocumentationLink(result.module)
          });
        });
      }

      // Generate recommendations for failed tests
      result.details.forEach(detail => {
        if (detail.result === 'FAIL') {
          recommendations.push({
            severity: 'MEDIUM',
            component: detail.component,
            issue: `Test failure: ${detail.test}`,
            solution: detail.message || 'Check test implementation and system configuration',
            documentation: this.getDocumentationLink(result.module)
          });
        }
      });
    });

    // Add performance recommendations
    const slowModules = results.filter(r => r.duration > 30000); // > 30 seconds
    slowModules.forEach(result => {
      recommendations.push({
        severity: 'LOW',
        component: result.module,
        issue: `Slow verification performance: ${result.duration}ms`,
        solution: 'Consider optimizing verification logic or increasing timeout values',
        documentation: 'Performance optimization guide'
      });
    });

    return recommendations;
  }

  private getSolutionForError(module: string, errorMessage: string): string {
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('connection') || errorLower.includes('network')) {
      return 'Check network connectivity and service availability. Verify configuration settings.';
    }
    
    if (errorLower.includes('permission') || errorLower.includes('access')) {
      return 'Check file permissions and access rights. Ensure proper authentication credentials.';
    }
    
    if (errorLower.includes('timeout')) {
      return 'Increase timeout values or check for performance issues in the target service.';
    }
    
    if (errorLower.includes('not found') || errorLower.includes('missing')) {
      return 'Verify that all required files, dependencies, and configurations are present.';
    }
    
    switch (module) {
      case 'infrastructure':
        return 'Check package.json files, environment variables, and directory structure.';
      case 'backend':
        return 'Verify server configuration, API endpoints, and service initialization.';
      case 'frontend':
        return 'Check React application build, routing configuration, and component rendering.';
      case 'authentication':
        return 'Verify Supabase Auth configuration, user credentials, and role-based access.';
      case 'database':
        return 'Check Supabase connection, RLS policies, and migration status.';
      case 'download_system':
        return 'Verify JW.org URLs, download configuration, and file system permissions.';
      case 'test_suite':
        return 'Check Cypress installation, test configuration, and browser compatibility.';
      case 'scripts':
        return 'Verify npm scripts, environment variables, and build configuration.';
      default:
        return 'Review module-specific documentation and check system logs for more details.';
    }
  }

  private getDocumentationLink(module: string): string {
    const baseUrl = 'https://github.com/your-repo/sistema-ministerial/docs';
    return `${baseUrl}/${module}-troubleshooting.md`;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARNING': return '⚠️';
      default: return '❓';
    }
  }

  private calculatePercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}

// Export singleton instance
export const enhancedReportGenerator = new EnhancedReportGenerator();