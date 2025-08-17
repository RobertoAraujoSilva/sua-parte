// CLI entry point for the verification system

import { verificationSystem } from './index';
import { VerificationModule } from './interfaces';
import { SystemVerificationController } from './controller';
import { ReportCLI } from './report-cli';

/**
 * Simple CLI interface for running verification
 */
export class VerificationCLI {
  private controller: SystemVerificationController;

  constructor() {
    this.controller = verificationSystem;
  }

  /**
   * Run verification based on command line arguments
   */
  public async run(args: string[] = []): Promise<void> {
    try {
      console.log('🔍 Sistema Ministerial Verification System');
      console.log('==========================================');

      // Initialize controller
      await this.controller.initialize();

      if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        this.showHelp();
        return;
      }

      // Handle report commands
      if (args[0] === 'reports') {
        const reportCLI = new ReportCLI();
        await reportCLI.run(['node', 'report-cli.js', ...args.slice(1)]);
        return;
      }

      if (args.includes('--full')) {
        await this.runFullVerification();
        return;
      }

      // Check for specific module verification
      const moduleArg = args.find(arg => arg.startsWith('--module='));
      if (moduleArg) {
        const moduleName = moduleArg.split('=')[1];
        await this.runModuleVerification(moduleName);
        return;
      }

      // Default to showing help
      this.showHelp();
    } catch (error) {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
Usage: node src/verification/cli.js [command] [options]

Verification Commands:
  --full                    Run full system verification with historical tracking
  --module=<module>         Run verification for specific module
  --help, -h               Show this help message

Report Management Commands:
  reports list             List all stored verification reports
  reports show <id>        Show details of a specific report
  reports export <id>      Export report in various formats (JSON, HTML, PDF)
  reports compare <id1> <id2>  Compare two reports
  reports trends           Show historical trends analysis
  reports dashboard        Show system health dashboard
  reports cleanup          Clean up old reports
  reports init             Initialize report storage system

Available modules:
  - infrastructure         Check dependencies and environment
  - backend               Verify backend server and APIs
  - frontend              Verify React application
  - authentication        Test authentication system
  - download_system       Verify JW.org integration
  - database              Test database operations
  - test_suite            Run Cypress tests
  - scripts               Test npm scripts

Examples:
  node src/verification/cli.js --full
  node src/verification/cli.js --module=backend
  node src/verification/cli.js reports list
  node src/verification/cli.js reports dashboard
  node src/verification/cli.js reports export report-123 --format html
`);
  }

  /**
   * Run full verification with historical tracking
   */
  private async runFullVerification(): Promise<void> {
    console.log('🚀 Starting full system verification with historical tracking...\n');

    const results = await this.controller.runFullVerification();
    const historicalReport = await this.controller.generateHistoricalReport(results);

    console.log('\n📊 Verification Results:');
    console.log('========================');
    console.log(`Overall Status: ${this.getStatusEmoji(historicalReport.report.overallStatus)} ${historicalReport.report.overallStatus}`);
    console.log(`Total Duration: ${this.formatDuration(historicalReport.report.totalDuration)}`);
    console.log(`Tests: ${historicalReport.report.summary.totalTests} total, ${historicalReport.report.summary.passed} passed, ${historicalReport.report.summary.failed} failed, ${historicalReport.report.summary.warnings} warnings`);

    // Show historical trends
    if (historicalReport.trends.length > 0) {
      console.log('\n📈 Historical Trends (Last 30 days):');
      console.log('====================================');
      historicalReport.trends.forEach(trend => {
        const trendIcon = trend.trend === 'improving' ? '📈' : 
                         trend.trend === 'declining' ? '📉' : '➡️';
        console.log(`${trendIcon} ${trend.metric}: ${trend.trend} (${trend.changePercent.toFixed(1)}% change)`);
      });
    }

    // Show comparison with previous report
    if (historicalReport.comparison) {
      console.log('\n🔄 Changes from Previous Report:');
      console.log('================================');
      
      if (historicalReport.comparison.improvements.length > 0) {
        console.log('✅ Improvements:');
        historicalReport.comparison.improvements.forEach(improvement => {
          console.log(`  • ${improvement}`);
        });
      }
      
      if (historicalReport.comparison.regressions.length > 0) {
        console.log('❌ Regressions:');
        historicalReport.comparison.regressions.forEach(regression => {
          console.log(`  • ${regression}`);
        });
      }

      if (historicalReport.comparison.newIssues.length > 0) {
        console.log('🆕 New Issues:');
        historicalReport.comparison.newIssues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }

      if (historicalReport.comparison.resolvedIssues.length > 0) {
        console.log('✅ Resolved Issues:');
        historicalReport.comparison.resolvedIssues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
    }

    if (historicalReport.report.summary.failed > 0 || historicalReport.report.summary.warnings > 0) {
      console.log('\n⚠️  Current Issues:');
      console.log('==================');
      historicalReport.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.severity}] ${rec.component}: ${rec.issue}`);
        console.log(`   Solution: ${rec.solution}`);
        if (rec.documentation) {
          console.log(`   Docs: ${rec.documentation}`);
        }
        console.log('');
      });
    }

    console.log('\n💾 Report stored with historical tracking');
    console.log('📊 Use "reports dashboard" to view system health overview');
    console.log('📈 Use "reports trends" to analyze historical performance');
    console.log('\n✅ Verification completed!');
  }

  /**
   * Run verification for a specific module
   */
  private async runModuleVerification(moduleName: string): Promise<void> {
    const moduleEnum = this.getModuleEnum(moduleName);
    if (!moduleEnum) {
      console.error(`❌ Unknown module: ${moduleName}`);
      this.showHelp();
      return;
    }

    console.log(`🔄 Running ${moduleName} verification...\n`);

    try {
      const result = await this.controller.runModuleVerification(moduleEnum);
      
      console.log('\n📊 Module Verification Results:');
      console.log('===============================');
      console.log(`Module: ${result.module}`);
      console.log(`Status: ${this.getStatusEmoji(result.status)} ${result.status}`);
      console.log(`Duration: ${this.formatDuration(result.duration)}`);
      console.log(`Tests: ${result.details.length} total`);

      if (result.details.length > 0) {
        console.log('\nTest Details:');
        result.details.forEach((detail, index) => {
          const emoji = this.getStatusEmoji(detail.result);
          console.log(`  ${index + 1}. ${emoji} ${detail.component} - ${detail.test}: ${detail.message}`);
        });
      }

      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.message}`);
        });
      }

      console.log('\n✅ Module verification completed!');
    } catch (error) {
      console.error(`❌ Module verification failed: ${error}`);
    }
  }

  /**
   * Convert module name to enum
   */
  private getModuleEnum(moduleName: string): VerificationModule | null {
    const moduleMap: Record<string, VerificationModule> = {
      'infrastructure': VerificationModule.INFRASTRUCTURE,
      'backend': VerificationModule.BACKEND,
      'frontend': VerificationModule.FRONTEND,
      'authentication': VerificationModule.AUTHENTICATION,
      'download_system': VerificationModule.DOWNLOAD_SYSTEM,
      'database': VerificationModule.DATABASE,
      'test_suite': VerificationModule.TEST_SUITE,
      'scripts': VerificationModule.SCRIPTS
    };

    return moduleMap[moduleName] || null;
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'PASS':
      case 'HEALTHY':
        return '✅';
      case 'FAIL':
      case 'CRITICAL_FAILURES':
        return '❌';
      case 'WARNING':
      case 'ISSUES_FOUND':
        return '⚠️';
      default:
        return '❓';
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}

// If this file is run directly, execute the CLI
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  const cli = new VerificationCLI();
  cli.run(process.argv.slice(2));
}