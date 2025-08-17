// Report storage and historical tracking system

import * as fs from 'fs/promises';
import * as path from 'path';
import { VerificationReport, VerificationResult, VerificationSummary, OverallStatus } from './types';

export interface StoredReport {
  id: string;
  timestamp: Date;
  report: VerificationReport;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  version: string;
  environment: string;
  gitCommit?: string;
  branch?: string;
  tags: string[];
}

export interface HistoricalTrend {
  metric: string;
  values: Array<{
    timestamp: Date;
    value: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
}

export interface ComparisonResult {
  current: StoredReport;
  previous: StoredReport;
  improvements: string[];
  regressions: string[];
  newIssues: string[];
  resolvedIssues: string[];
  trendAnalysis: HistoricalTrend[];
}

export interface ExportOptions {
  format: 'json' | 'html' | 'pdf';
  includeHistory?: boolean;
  includeCharts?: boolean;
  template?: string;
}

export class ReportStorageManager {
  private readonly storageDir: string;
  private readonly reportsDir: string;
  private readonly indexFile: string;
  private readonly maxReports: number;

  constructor(baseDir: string = './verification-reports', maxReports: number = 100) {
    this.storageDir = path.resolve(baseDir);
    this.reportsDir = path.join(this.storageDir, 'reports');
    this.indexFile = path.join(this.storageDir, 'index.json');
    this.maxReports = maxReports;
  }

  /**
   * Initialize storage directory structure
   */
  async initialize(): Promise<void> {
    try {
      await this.ensureDirectoryExists(this.storageDir);
      await this.ensureDirectoryExists(this.reportsDir);
      
      // Create index file if it doesn't exist
      if (!await this.fileExists(this.indexFile)) {
        await this.writeFile(this.indexFile, JSON.stringify([], null, 2));
      }

      console.log(`📁 Report storage initialized at: ${this.storageDir}`);
    } catch (error) {
      console.error('❌ Failed to initialize report storage:', error);
      await this.autoFixStorageIssues();
      throw error;
    }
  }

  /**
   * Store a verification report with timestamped storage
   */
  async storeReport(
    report: VerificationReport, 
    metadata: Partial<ReportMetadata> = {}
  ): Promise<StoredReport> {
    try {
      const reportId = this.generateReportId();
      const timestamp = new Date();
      
      const storedReport: StoredReport = {
        id: reportId,
        timestamp,
        report,
        metadata: {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          tags: [],
          ...metadata
        }
      };

      // Store report file
      const reportFile = path.join(this.reportsDir, `${reportId}.json`);
      await this.writeFile(reportFile, JSON.stringify(storedReport, null, 2));

      // Update index
      await this.updateIndex(storedReport);

      // Cleanup old reports if needed
      await this.cleanupOldReports();

      console.log(`💾 Report stored successfully: ${reportId}`);
      return storedReport;

    } catch (error) {
      console.error('❌ Failed to store report:', error);
      await this.autoFixStorageIssues();
      throw error;
    }
  }

  /**
   * Retrieve a specific report by ID
   */
  async getReport(reportId: string): Promise<StoredReport | null> {
    try {
      const reportFile = path.join(this.reportsDir, `${reportId}.json`);
      
      if (!await this.fileExists(reportFile)) {
        return null;
      }

      const content = await this.readFile(reportFile);
      const storedReport = JSON.parse(content) as StoredReport;
      
      // Convert timestamp back to Date object
      storedReport.timestamp = new Date(storedReport.timestamp);
      storedReport.report.timestamp = new Date(storedReport.report.timestamp);
      
      return storedReport;

    } catch (error) {
      console.error(`❌ Failed to retrieve report ${reportId}:`, error);
      await this.autoFixDataCorruption(reportId);
      return null;
    }
  }

  /**
   * Get all stored reports with optional filtering
   */
  async getAllReports(
    limit?: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<StoredReport[]> {
    try {
      const index = await this.getIndex();
      let reports = [...index];

      // Filter by date range
      if (startDate || endDate) {
        reports = reports.filter(report => {
          const reportDate = new Date(report.timestamp);
          if (startDate && reportDate < startDate) return false;
          if (endDate && reportDate > endDate) return false;
          return true;
        });
      }

      // Sort by timestamp (newest first)
      reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply limit
      if (limit) {
        reports = reports.slice(0, limit);
      }

      // Load full report data
      const fullReports: StoredReport[] = [];
      for (const indexEntry of reports) {
        const fullReport = await this.getReport(indexEntry.id);
        if (fullReport) {
          fullReports.push(fullReport);
        }
      }

      return fullReports;

    } catch (error) {
      console.error('❌ Failed to retrieve reports:', error);
      await this.autoFixIndexCorruption();
      return [];
    }
  }

  /**
   * Generate historical trend analysis
   */
  async generateTrendAnalysis(days: number = 30): Promise<HistoricalTrend[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const reports = await this.getAllReports(undefined, startDate, endDate);
      
      if (reports.length < 2) {
        return [];
      }

      const trends: HistoricalTrend[] = [];

      // Analyze pass rate trend
      const passRateTrend = this.calculateTrend(
        reports,
        'Pass Rate',
        (report) => {
          const summary = report.report.summary;
          return summary.totalTests > 0 ? (summary.passed / summary.totalTests) * 100 : 0;
        }
      );
      trends.push(passRateTrend);

      // Analyze execution time trend
      const executionTimeTrend = this.calculateTrend(
        reports,
        'Execution Time (ms)',
        (report) => report.report.totalDuration
      );
      trends.push(executionTimeTrend);

      // Analyze critical issues trend
      const criticalIssuesTrend = this.calculateTrend(
        reports,
        'Critical Issues',
        (report) => report.report.summary.criticalIssues
      );
      trends.push(criticalIssuesTrend);

      // Analyze warning count trend
      const warningsTrend = this.calculateTrend(
        reports,
        'Warnings',
        (report) => report.report.summary.warnings
      );
      trends.push(warningsTrend);

      return trends;

    } catch (error) {
      console.error('❌ Failed to generate trend analysis:', error);
      return [];
    }
  }

  /**
   * Compare two reports and identify changes
   */
  async compareReports(currentId: string, previousId: string): Promise<ComparisonResult | null> {
    try {
      const current = await this.getReport(currentId);
      const previous = await this.getReport(previousId);

      if (!current || !previous) {
        return null;
      }

      const improvements: string[] = [];
      const regressions: string[] = [];
      const newIssues: string[] = [];
      const resolvedIssues: string[] = [];

      // Compare overall status
      if (current.report.overallStatus === 'HEALTHY' && previous.report.overallStatus !== 'HEALTHY') {
        improvements.push('Overall system status improved to HEALTHY');
      } else if (current.report.overallStatus !== 'HEALTHY' && previous.report.overallStatus === 'HEALTHY') {
        regressions.push('Overall system status degraded from HEALTHY');
      }

      // Compare module results
      const currentModules = new Map(current.report.moduleResults.map(r => [r.module, r]));
      const previousModules = new Map(previous.report.moduleResults.map(r => [r.module, r]));

      // Check for improvements and regressions
      for (const [module, currentResult] of currentModules) {
        const previousResult = previousModules.get(module);
        
        if (!previousResult) {
          newIssues.push(`New module added: ${module}`);
          continue;
        }

        if (currentResult.status === 'PASS' && previousResult.status !== 'PASS') {
          improvements.push(`${module} module status improved to PASS`);
        } else if (currentResult.status !== 'PASS' && previousResult.status === 'PASS') {
          regressions.push(`${module} module status degraded from PASS`);
        }
      }

      // Check for removed modules
      for (const [module] of previousModules) {
        if (!currentModules.has(module)) {
          resolvedIssues.push(`Module removed: ${module}`);
        }
      }

      // Generate trend analysis for comparison period
      const trendAnalysis = await this.generateTrendAnalysis(7); // Last 7 days

      return {
        current,
        previous,
        improvements,
        regressions,
        newIssues,
        resolvedIssues,
        trendAnalysis
      };

    } catch (error) {
      console.error('❌ Failed to compare reports:', error);
      return null;
    }
  }

  /**
   * Export report in specified format
   */
  async exportReport(
    reportId: string, 
    options: ExportOptions,
    outputPath?: string
  ): Promise<string> {
    try {
      const report = await this.getReport(reportId);
      if (!report) {
        throw new Error(`Report not found: ${reportId}`);
      }

      const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-');
      const defaultPath = path.join(this.storageDir, 'exports', `report-${reportId}-${timestamp}`);
      
      switch (options.format) {
        case 'json':
          return await this.exportAsJSON(report, options, outputPath || `${defaultPath}.json`);
        case 'html':
          return await this.exportAsHTML(report, options, outputPath || `${defaultPath}.html`);
        case 'pdf':
          return await this.exportAsPDF(report, options, outputPath || `${defaultPath}.pdf`);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

    } catch (error) {
      console.error('❌ Failed to export report:', error);
      await this.autoFixExportErrors(reportId, options);
      throw error;
    }
  }

  /**
   * Delete old reports to maintain storage limits
   */
  async cleanupOldReports(): Promise<void> {
    try {
      const index = await this.getIndex();
      
      if (index.length <= this.maxReports) {
        return;
      }

      // Sort by timestamp and keep only the most recent reports
      const sortedReports = index.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const reportsToDelete = sortedReports.slice(this.maxReports);
      
      for (const report of reportsToDelete) {
        const reportFile = path.join(this.reportsDir, `${report.id}.json`);
        try {
          await fs.unlink(reportFile);
          console.log(`🗑️ Deleted old report: ${report.id}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete report file: ${reportFile}`, error);
        }
      }

      // Update index
      const updatedIndex = sortedReports.slice(0, this.maxReports);
      await this.writeFile(this.indexFile, JSON.stringify(updatedIndex, null, 2));

      console.log(`🧹 Cleaned up ${reportsToDelete.length} old reports`);

    } catch (error) {
      console.error('❌ Failed to cleanup old reports:', error);
    }
  }

  // Private helper methods

  private generateReportId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `report-${timestamp}-${random}`;
  }

  private async getIndex(): Promise<Array<{id: string, timestamp: Date}>> {
    try {
      const content = await this.readFile(this.indexFile);
      const index = JSON.parse(content);
      return index.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.warn('⚠️ Failed to read index, creating new one');
      return [];
    }
  }

  private async updateIndex(storedReport: StoredReport): Promise<void> {
    const index = await this.getIndex();
    index.push({
      id: storedReport.id,
      timestamp: storedReport.timestamp
    });
    
    await this.writeFile(this.indexFile, JSON.stringify(index, null, 2));
  }

  private calculateTrend(
    reports: StoredReport[],
    metricName: string,
    valueExtractor: (report: StoredReport) => number
  ): HistoricalTrend {
    const values = reports.map(report => ({
      timestamp: report.timestamp,
      value: valueExtractor(report)
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (values.length < 2) {
      return {
        metric: metricName,
        values,
        trend: 'stable',
        changePercent: 0
      };
    }

    const firstValue = values[0].value;
    const lastValue = values[values.length - 1].value;
    const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) { // 5% threshold for significant change
      if (metricName.includes('Pass Rate')) {
        trend = changePercent > 0 ? 'improving' : 'declining';
      } else if (metricName.includes('Issues') || metricName.includes('Warnings') || metricName.includes('Time')) {
        trend = changePercent < 0 ? 'improving' : 'declining';
      }
    }

    return {
      metric: metricName,
      values,
      trend,
      changePercent
    };
  }

  // Export format implementations

  private async exportAsJSON(
    report: StoredReport,
    options: ExportOptions,
    outputPath: string
  ): Promise<string> {
    await this.ensureDirectoryExists(path.dirname(outputPath));
    
    let exportData: any = report;
    
    if (options.includeHistory) {
      const trends = await this.generateTrendAnalysis();
      exportData = {
        ...report,
        historicalTrends: trends
      };
    }

    await this.writeFile(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`📄 JSON report exported to: ${outputPath}`);
    return outputPath;
  }

  private async exportAsHTML(
    report: StoredReport,
    options: ExportOptions,
    outputPath: string
  ): Promise<string> {
    await this.ensureDirectoryExists(path.dirname(outputPath));
    
    const html = this.generateHTMLReport(report, options);
    await this.writeFile(outputPath, html);
    
    console.log(`🌐 HTML report exported to: ${outputPath}`);
    return outputPath;
  }

  private async exportAsPDF(
    report: StoredReport,
    options: ExportOptions,
    outputPath: string
  ): Promise<string> {
    // For now, generate HTML and suggest PDF conversion
    // In a full implementation, you would use a library like puppeteer
    const htmlPath = outputPath.replace('.pdf', '.html');
    await this.exportAsHTML(report, options, htmlPath);
    
    console.log(`📋 PDF export not fully implemented. HTML version created at: ${htmlPath}`);
    console.log(`💡 To convert to PDF, use: npx puppeteer print ${htmlPath} ${outputPath}`);
    
    return htmlPath;
  }

  private generateHTMLReport(report: StoredReport, options: ExportOptions): string {
    const statusColor = (status: string) => {
      switch (status) {
        case 'PASS': return '#22c55e';
        case 'FAIL': return '#ef4444';
        case 'WARNING': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Report - ${report.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f9fafb; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; }
        .module-result { margin: 15px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .details-list { margin: 10px 0; }
        .detail-item { padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
        .recommendations { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema Ministerial Verification Report</h1>
            <p><strong>Report ID:</strong> ${report.id}</p>
            <p><strong>Generated:</strong> ${report.timestamp.toLocaleString()}</p>
            <p><strong>Environment:</strong> ${report.metadata.environment}</p>
            <span class="status-badge" style="background-color: ${statusColor(report.report.overallStatus)}">
                ${report.report.overallStatus}
            </span>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div style="font-size: 2em; font-weight: bold;">${report.report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div style="font-size: 2em; font-weight: bold; color: #22c55e;">${report.report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div style="font-size: 2em; font-weight: bold; color: #ef4444;">${report.report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div style="font-size: 2em; font-weight: bold; color: #f59e0b;">${report.report.summary.warnings}</div>
            </div>
        </div>

        <h2>Module Results</h2>
        ${report.report.moduleResults.map(result => `
            <div class="module-result">
                <h3>${result.module} 
                    <span class="status-badge" style="background-color: ${statusColor(result.status)}; font-size: 0.8em;">
                        ${result.status}
                    </span>
                </h3>
                <p><strong>Duration:</strong> ${result.duration}ms</p>
                
                ${result.details.length > 0 ? `
                    <div class="details-list">
                        <h4>Test Details:</h4>
                        ${result.details.map(detail => `
                            <div class="detail-item">
                                <span style="color: ${statusColor(detail.result)};">●</span>
                                <strong>${detail.component}:</strong> ${detail.test} - ${detail.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${result.errors && result.errors.length > 0 ? `
                    <div style="color: #ef4444; margin-top: 10px;">
                        <h4>Errors:</h4>
                        ${result.errors.map(error => `<div>• ${error.message}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}

        ${report.report.recommendations.length > 0 ? `
            <div class="recommendations">
                <h2>Recommendations</h2>
                ${report.report.recommendations.map(rec => `
                    <div style="margin: 10px 0;">
                        <strong style="color: ${statusColor(rec.severity)};">[${rec.severity}]</strong>
                        <strong>${rec.component}:</strong> ${rec.issue}
                        <br><em>Solution:</em> ${rec.solution}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
            <p>Generated by Sistema Ministerial Verification System</p>
            <p>Total execution time: ${report.report.totalDuration}ms</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Auto-fix implementations

  private async autoFixStorageIssues(): Promise<void> {
    console.log('🔧 Attempting to auto-fix storage issues...');
    
    try {
      // Try to create directories with proper permissions
      await this.ensureDirectoryExists(this.storageDir, 0o755);
      await this.ensureDirectoryExists(this.reportsDir, 0o755);
      
      // Try to fix index file
      if (!await this.fileExists(this.indexFile)) {
        await this.writeFile(this.indexFile, JSON.stringify([], null, 2));
      }
      
      console.log('✅ Storage issues auto-fixed');
    } catch (error) {
      console.error('❌ Failed to auto-fix storage issues:', error);
    }
  }

  private async autoFixDataCorruption(reportId: string): Promise<void> {
    console.log(`🔧 Attempting to auto-fix data corruption for report: ${reportId}`);
    
    try {
      const reportFile = path.join(this.reportsDir, `${reportId}.json`);
      const backupFile = `${reportFile}.backup`;
      
      // Try to restore from backup if it exists
      if (await this.fileExists(backupFile)) {
        await fs.copyFile(backupFile, reportFile);
        console.log('✅ Restored report from backup');
        return;
      }
      
      // Remove corrupted entry from index
      const index = await this.getIndex();
      const filteredIndex = index.filter(entry => entry.id !== reportId);
      await this.writeFile(this.indexFile, JSON.stringify(filteredIndex, null, 2));
      
      console.log('✅ Removed corrupted report from index');
    } catch (error) {
      console.error('❌ Failed to auto-fix data corruption:', error);
    }
  }

  private async autoFixIndexCorruption(): Promise<void> {
    console.log('🔧 Attempting to auto-fix index corruption...');
    
    try {
      // Rebuild index from existing report files
      const reportFiles = await fs.readdir(this.reportsDir);
      const newIndex: Array<{id: string, timestamp: Date}> = [];
      
      for (const file of reportFiles) {
        if (file.endsWith('.json') && !file.endsWith('.backup')) {
          try {
            const reportPath = path.join(this.reportsDir, file);
            const content = await this.readFile(reportPath);
            const report = JSON.parse(content) as StoredReport;
            
            newIndex.push({
              id: report.id,
              timestamp: new Date(report.timestamp)
            });
          } catch (error) {
            console.warn(`⚠️ Skipping corrupted report file: ${file}`);
          }
        }
      }
      
      await this.writeFile(this.indexFile, JSON.stringify(newIndex, null, 2));
      console.log(`✅ Rebuilt index with ${newIndex.length} reports`);
      
    } catch (error) {
      console.error('❌ Failed to auto-fix index corruption:', error);
    }
  }

  private async autoFixExportErrors(reportId: string, options: ExportOptions): Promise<void> {
    console.log(`🔧 Attempting to auto-fix export errors for report: ${reportId}`);
    
    try {
      // Ensure export directory exists
      const exportDir = path.join(this.storageDir, 'exports');
      await this.ensureDirectoryExists(exportDir);
      
      // Validate export options
      if (!['json', 'html', 'pdf'].includes(options.format)) {
        console.log('✅ Fixed invalid export format, defaulting to JSON');
        options.format = 'json';
      }
      
      console.log('✅ Export environment prepared');
    } catch (error) {
      console.error('❌ Failed to auto-fix export errors:', error);
    }
  }

  // File system utilities with error handling

  private async ensureDirectoryExists(dirPath: string, mode: number = 0o755): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true, mode });
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    // Create backup for existing files
    if (await this.fileExists(filePath)) {
      const backupPath = `${filePath}.backup`;
      try {
        await fs.copyFile(filePath, backupPath);
      } catch (error) {
        console.warn(`⚠️ Failed to create backup for ${filePath}:`, error);
      }
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

// Export singleton instance
export const reportStorage = new ReportStorageManager();