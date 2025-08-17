// Base verification controller class with orchestration logic

import {
  VerificationController,
  VerificationModule,
  BaseVerifier,
  ReportGenerator
} from './interfaces';
import {
  VerificationResult,
  VerificationReport,
  VerificationSummary,
  OverallStatus,
  Recommendation
} from './types';
import { EnhancedReportGenerator } from './report-generator';

export class SystemVerificationController implements VerificationController {
  private verifiers: Map<VerificationModule, BaseVerifier> = new Map();
  private reportGenerator?: ReportGenerator;
  private enhancedReportGenerator: EnhancedReportGenerator;

  constructor() {
    // Initialize with empty verifiers map - will be populated by individual modules
    this.enhancedReportGenerator = new EnhancedReportGenerator();
  }

  /**
   * Initialize the controller and report storage
   */
  public async initialize(): Promise<void> {
    await this.enhancedReportGenerator.initialize();
    console.log('🎯 System verification controller initialized');
  }

  /**
   * Register a verifier for a specific module
   */
  public registerVerifier(module: VerificationModule, verifier: BaseVerifier): void {
    this.verifiers.set(module, verifier);
  }

  /**
   * Register a report generator
   */
  public registerReportGenerator(generator: ReportGenerator): void {
    this.reportGenerator = generator;
  }

  /**
   * Run full verification across all registered modules
   */
  public async runFullVerification(): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];
    const startTime = Date.now();

    console.log('🔍 Starting full system verification...');
    console.log(`📋 Found ${this.verifiers.size} verification modules`);

    // Execute verifications in parallel where possible
    const verificationPromises = Array.from(this.verifiers.entries()).map(
      async ([module, verifier]) => {
        try {
          console.log(`🔄 Running ${module} verification...`);
          const moduleStartTime = Date.now();
          
          const result = await verifier.verify();
          
          const duration = Date.now() - moduleStartTime;
          console.log(`✅ ${module} verification completed in ${duration}ms - Status: ${result.status}`);
          
          return result;
        } catch (error) {
          console.error(`❌ ${module} verification failed:`, error);
          
          return {
            module,
            status: 'FAIL' as const,
            timestamp: new Date(),
            duration: Date.now() - Date.now(),
            details: [],
            errors: [error instanceof Error ? error : new Error(String(error))]
          } as VerificationResult;
        }
      }
    );

    // Wait for all verifications to complete
    const moduleResults = await Promise.allSettled(verificationPromises);
    
    // Process results
    moduleResults.forEach((result, index) => {
      const module = Array.from(this.verifiers.keys())[index];
      
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`❌ ${module} verification promise rejected:`, result.reason);
        results.push({
          module,
          status: 'FAIL',
          timestamp: new Date(),
          duration: 0,
          details: [],
          errors: [new Error(`Verification promise rejected: ${result.reason}`)]
        });
      }
    });

    const totalDuration = Date.now() - startTime;
    console.log(`🏁 Full verification completed in ${totalDuration}ms`);

    // Cleanup verifiers
    await this.cleanup();

    return results;
  }

  /**
   * Run verification for a specific module
   */
  public async runModuleVerification(module: VerificationModule): Promise<VerificationResult> {
    const verifier = this.verifiers.get(module);
    
    if (!verifier) {
      throw new Error(`No verifier registered for module: ${module}`);
    }

    console.log(`🔄 Running ${module} verification...`);
    const startTime = Date.now();

    try {
      const result = await verifier.verify();
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${module} verification completed in ${duration}ms - Status: ${result.status}`);
      
      // Cleanup this specific verifier
      if (verifier.cleanup) {
        await verifier.cleanup();
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${module} verification failed after ${duration}ms:`, error);
      
      return {
        module,
        status: 'FAIL',
        timestamp: new Date(),
        duration,
        details: [],
        errors: [error instanceof Error ? error : new Error(String(error))]
      };
    }
  }

  /**
   * Generate comprehensive verification report
   */
  public async generateReport(results: VerificationResult[]): Promise<VerificationReport> {
    if (this.reportGenerator) {
      return await this.reportGenerator.generateReport(results);
    }

    // Use enhanced report generator with storage capabilities
    return await this.enhancedReportGenerator.generateReport(results, {
      includeRecommendations: true,
      includeHistoricalData: true,
      autoStore: true
    });
  }

  /**
   * Generate report with historical analysis
   */
  public async generateHistoricalReport(results: VerificationResult[]) {
    return await this.enhancedReportGenerator.generateHistoricalReport(results, {
      includeRecommendations: true,
      includeHistoricalData: true,
      autoStore: true
    });
  }

  /**
   * Export report in specified format
   */
  public async exportReport(
    reportId: string,
    format: 'json' | 'html' | 'pdf',
    outputPath?: string
  ): Promise<string> {
    return await this.enhancedReportGenerator.exportStoredReport(reportId, format, outputPath);
  }

  /**
   * Get stored reports
   */
  public async getStoredReports(limit?: number) {
    return await this.enhancedReportGenerator.getStoredReports(limit);
  }

  /**
   * Get dashboard data for monitoring
   */
  public async getDashboardData() {
    return await this.enhancedReportGenerator.generateDashboardData();
  }

  /**
   * Generate trend analysis
   */
  public async getTrendAnalysis(days: number = 30) {
    return await this.enhancedReportGenerator.generateTrendAnalysis(days);
  }

  /**
   * Compare two reports
   */
  public async compareReports(currentId: string, previousId: string) {
    return await this.enhancedReportGenerator.compareReports(currentId, previousId);
  }

  /**
   * Cleanup old reports
   */
  public async cleanupOldReports(): Promise<void> {
    await this.enhancedReportGenerator.cleanupOldReports();
  }

  /**
   * Get list of registered verification modules
   */
  public getRegisteredModules(): VerificationModule[] {
    return Array.from(this.verifiers.keys());
  }

  /**
   * Check if a specific module is registered
   */
  public isModuleRegistered(module: VerificationModule): boolean {
    return this.verifiers.has(module);
  }

  /**
   * Get verification status summary
   */
  public getVerificationSummary(results: VerificationResult[]): VerificationSummary {
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
            if (result.errors && result.errors.length > 0) {
              summary.criticalIssues++;
            }
            break;
          case 'WARNING':
            summary.warnings++;
            break;
        }
      });
    });

    return summary;
  }

  /**
   * Cleanup all verifiers
   */
  private async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.verifiers.values())
      .filter(verifier => verifier.cleanup)
      .map(verifier => verifier.cleanup!());

    if (cleanupPromises.length > 0) {
      console.log('🧹 Cleaning up verifiers...');
      await Promise.allSettled(cleanupPromises);
    }
  }

  /**
   * Generate default report when no custom generator is available
   */
  private generateDefaultReport(results: VerificationResult[]): VerificationReport {
    const timestamp = new Date();
    const summary = this.getVerificationSummary(results);
    
    // Calculate total duration
    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    
    // Determine overall status
    let overallStatus: OverallStatus = 'HEALTHY';
    if (summary.criticalIssues > 0) {
      overallStatus = 'CRITICAL_FAILURES';
    } else if (summary.failed > 0 || summary.warnings > 0) {
      overallStatus = 'ISSUES_FOUND';
    }

    // Generate recommendations
    const recommendations: Recommendation[] = [];
    
    results.forEach(result => {
      if (result.status === 'FAIL' && result.errors) {
        result.errors.forEach(error => {
          recommendations.push({
            severity: 'HIGH',
            component: result.module,
            issue: error.message,
            solution: 'Please check the error details and resolve the underlying issue',
            documentation: 'Refer to the system documentation for troubleshooting guidance'
          });
        });
      }
      
      if (result.status === 'WARNING' && result.warnings) {
        result.warnings.forEach(warning => {
          recommendations.push({
            severity: 'MEDIUM',
            component: result.module,
            issue: warning.message || 'Warning detected',
            solution: 'Review the warning and consider addressing it to improve system reliability'
          });
        });
      }
    });

    return {
      overallStatus,
      timestamp,
      totalDuration,
      summary,
      moduleResults: results,
      recommendations
    };
  }
}

// Export a singleton instance for global use
export const systemVerificationController = new SystemVerificationController();