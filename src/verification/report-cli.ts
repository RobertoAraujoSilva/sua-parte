// CLI interface for report management and historical tracking

import { Command } from 'commander';
import { EnhancedReportGenerator } from './report-generator';
import { ReportStorageManager } from './report-storage';
import * as path from 'path';

export class ReportCLI
{
  private reportGenerator: EnhancedReportGenerator;
  private storage: ReportStorageManager;
  private program: any;

  constructor ()
  {
    this.storage = new ReportStorageManager();
    this.reportGenerator = new EnhancedReportGenerator( this.storage );
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands (): void
  {
    this.program
      .name( 'verification-reports' )
      .description( 'Sistema Ministerial Verification Report Management' )
      .version( '1.0.0' );

    // List reports command
    this.program
      .command( 'list' )
      .description( 'List all stored verification reports' )
      .option( '-l, --limit <number>', 'Limit number of reports to show', '10' )
      .option( '--json', 'Output as JSON' )
      .action( async ( options ) =>
      {
        await this.listReports( parseInt( options.limit ), options.json );
      } );

    // Show report command
    this.program
      .command( 'show <reportId>' )
      .description( 'Show details of a specific report' )
      .option( '--json', 'Output as JSON' )
      .action( async ( reportId, options ) =>
      {
        await this.showReport( reportId, options.json );
      } );

    // Export report command
    this.program
      .command( 'export <reportId>' )
      .description( 'Export a report in specified format' )
      .option( '-f, --format <format>', 'Export format (json, html, pdf)', 'html' )
      .option( '-o, --output <path>', 'Output file path' )
      .option( '--include-history', 'Include historical data' )
      .option( '--include-charts', 'Include charts and graphs' )
      .action( async ( reportId, options ) =>
      {
        await this.exportReport( reportId, options );
      } );

    // Compare reports command
    this.program
      .command( 'compare <currentId> <previousId>' )
      .description( 'Compare two verification reports' )
      .option( '--json', 'Output as JSON' )
      .action( async ( currentId, previousId, options ) =>
      {
        await this.compareReports( currentId, previousId, options.json );
      } );

    // Trends command
    this.program
      .command( 'trends' )
      .description( 'Show historical trends analysis' )
      .option( '-d, --days <number>', 'Number of days to analyze', '30' )
      .option( '--json', 'Output as JSON' )
      .action( async ( options ) =>
      {
        await this.showTrends( parseInt( options.days ), options.json );
      } );

    // Dashboard command
    this.program
      .command( 'dashboard' )
      .description( 'Show system health dashboard' )
      .option( '--json', 'Output as JSON' )
      .action( async ( options ) =>
      {
        await this.showDashboard( options.json );
      } );

    // Cleanup command
    this.program
      .command( 'cleanup' )
      .description( 'Clean up old reports' )
      .option( '--dry-run', 'Show what would be deleted without actually deleting' )
      .action( async ( options ) =>
      {
        await this.cleanupReports( options.dryRun );
      } );

    // Initialize storage command
    this.program
      .command( 'init' )
      .description( 'Initialize report storage system' )
      .option( '--storage-dir <path>', 'Storage directory path', './verification-reports' )
      .action( async ( options ) =>
      {
        await this.initializeStorage( options.storageDir );
      } );
  }

  async run ( args: string[] ): Promise<void>
  {
    try
    {
      await this.reportGenerator.initialize();
      await this.program.parseAsync( args );
    } catch ( error )
    {
      console.error( '❌ CLI Error:', error );
      process.exit( 1 );
    }
  }

  private async listReports ( limit: number, jsonOutput: boolean ): Promise<void>
  {
    try
    {
      console.log( '📋 Fetching stored reports...' );
      const reports = await this.reportGenerator.getStoredReports( limit );

      if ( jsonOutput )
      {
        console.log( JSON.stringify( reports, null, 2 ) );
        return;
      }

      if ( reports.length === 0 )
      {
        console.log( '📭 No reports found' );
        return;
      }

      console.log( `\n📊 Found ${ reports.length } reports:\n` );
      console.log( 'ID'.padEnd( 25 ) + 'Timestamp'.padEnd( 25 ) + 'Status'.padEnd( 20 ) + 'Duration' );
      console.log( '-'.repeat( 80 ) );

      reports.forEach( report =>
      {
        const id = report.id.substring( 0, 22 ) + '...';
        const timestamp = report.timestamp.toLocaleString();
        const status = report.report.overallStatus;
        const duration = `${ report.report.totalDuration }ms`;

        console.log(
          id.padEnd( 25 ) +
          timestamp.padEnd( 25 ) +
          status.padEnd( 20 ) +
          duration
        );
      } );

    } catch ( error )
    {
      console.error( '❌ Failed to list reports:', error );
    }
  }

  private async showReport ( reportId: string, jsonOutput: boolean ): Promise<void>
  {
    try
    {
      console.log( `🔍 Fetching report: ${ reportId }` );
      const report = await this.reportGenerator.getStoredReport( reportId );

      if ( !report )
      {
        console.log( '❌ Report not found' );
        return;
      }

      if ( jsonOutput )
      {
        console.log( JSON.stringify( report, null, 2 ) );
        return;
      }

      // Display formatted report
      console.log( '\n' + '='.repeat( 60 ) );
      console.log( 'VERIFICATION REPORT DETAILS' );
      console.log( '='.repeat( 60 ) );
      console.log( `Report ID: ${ report.id }` );
      console.log( `Timestamp: ${ report.timestamp.toLocaleString() }` );
      console.log( `Environment: ${ report.metadata.environment }` );
      console.log( `Overall Status: ${ report.report.overallStatus }` );
      console.log( `Total Duration: ${ report.report.totalDuration }ms` );
      console.log( '' );

      // Summary
      const summary = report.report.summary;
      console.log( 'SUMMARY:' );
      console.log( `  Total Tests: ${ summary.totalTests }` );
      console.log( `  Passed: ${ summary.passed }` );
      console.log( `  Failed: ${ summary.failed }` );
      console.log( `  Warnings: ${ summary.warnings }` );
      console.log( `  Critical Issues: ${ summary.criticalIssues }` );
      console.log( '' );

      // Module results
      console.log( 'MODULE RESULTS:' );
      report.report.moduleResults.forEach( result =>
      {
        const statusIcon = this.getStatusIcon( result.status );
        console.log( `  ${ statusIcon } ${ result.module }: ${ result.status } (${ result.duration }ms)` );

        if ( result.errors && result.errors.length > 0 )
        {
          result.errors.forEach( error =>
          {
            console.log( `    ❌ ${ error.message }` );
          } );
        }
      } );

      // Recommendations
      if ( report.report.recommendations.length > 0 )
      {
        console.log( '\nRECOMMENDATIONS:' );
        report.report.recommendations.forEach( ( rec, index ) =>
        {
          console.log( `  ${ index + 1 }. [${ rec.severity }] ${ rec.component }: ${ rec.issue }` );
          console.log( `     Solution: ${ rec.solution }` );
        } );
      }

    } catch ( error )
    {
      console.error( '❌ Failed to show report:', error );
    }
  }

  private async exportReport ( reportId: string, options: any ): Promise<void>
  {
    try
    {
      console.log( `📤 Exporting report: ${ reportId }` );

      const outputPath = await this.reportGenerator.exportStoredReport(
        reportId,
        options.format,
        options.output,
        {
          includeHistory: options.includeHistory,
          includeCharts: options.includeCharts
        }
      );

      console.log( `✅ Report exported to: ${ outputPath }` );

    } catch ( error )
    {
      console.error( '❌ Failed to export report:', error );
    }
  }

  private async compareReports ( currentId: string, previousId: string, jsonOutput: boolean ): Promise<void>
  {
    try
    {
      console.log( `🔄 Comparing reports: ${ currentId } vs ${ previousId }` );

      const comparison = await this.reportGenerator.compareReports( currentId, previousId );

      if ( !comparison )
      {
        console.log( '❌ Could not compare reports (one or both not found)' );
        return;
      }

      if ( jsonOutput )
      {
        console.log( JSON.stringify( comparison, null, 2 ) );
        return;
      }

      console.log( '\n' + '='.repeat( 60 ) );
      console.log( 'REPORT COMPARISON' );
      console.log( '='.repeat( 60 ) );
      console.log( `Current: ${ comparison.current.id } (${ comparison.current.timestamp.toLocaleString() })` );
      console.log( `Previous: ${ comparison.previous.id } (${ comparison.previous.timestamp.toLocaleString() })` );
      console.log( '' );

      if ( comparison.improvements.length > 0 )
      {
        console.log( '✅ IMPROVEMENTS:' );
        comparison.improvements.forEach( improvement =>
        {
          console.log( `  • ${ improvement }` );
        } );
        console.log( '' );
      }

      if ( comparison.regressions.length > 0 )
      {
        console.log( '❌ REGRESSIONS:' );
        comparison.regressions.forEach( regression =>
        {
          console.log( `  • ${ regression }` );
        } );
        console.log( '' );
      }

      if ( comparison.newIssues.length > 0 )
      {
        console.log( '🆕 NEW ISSUES:' );
        comparison.newIssues.forEach( issue =>
        {
          console.log( `  • ${ issue }` );
        } );
        console.log( '' );
      }

      if ( comparison.resolvedIssues.length > 0 )
      {
        console.log( '✅ RESOLVED ISSUES:' );
        comparison.resolvedIssues.forEach( issue =>
        {
          console.log( `  • ${ issue }` );
        } );
        console.log( '' );
      }

    } catch ( error )
    {
      console.error( '❌ Failed to compare reports:', error );
    }
  }

  private async showTrends ( days: number, jsonOutput: boolean ): Promise<void>
  {
    try
    {
      console.log( `📈 Analyzing trends for the last ${ days } days...` );

      const trends = await this.reportGenerator.generateTrendAnalysis( days );

      if ( jsonOutput )
      {
        console.log( JSON.stringify( trends, null, 2 ) );
        return;
      }

      if ( trends.length === 0 )
      {
        console.log( '📭 No trend data available' );
        return;
      }

      console.log( '\n' + '='.repeat( 60 ) );
      console.log( 'HISTORICAL TRENDS ANALYSIS' );
      console.log( '='.repeat( 60 ) );

      trends.forEach( trend =>
      {
        const trendIcon = this.getTrendIcon( trend.trend );
        console.log( `\n${ trendIcon } ${ trend.metric }:` );
        console.log( `  Trend: ${ trend.trend } (${ trend.changePercent.toFixed( 1 ) }%)` );
        console.log( `  Data points: ${ trend.values.length }` );

        if ( trend.values.length > 0 )
        {
          const latest = trend.values[ trend.values.length - 1 ];
          const oldest = trend.values[ 0 ];
          console.log( `  Latest: ${ latest.value } (${ latest.timestamp.toLocaleDateString() })` );
          console.log( `  Oldest: ${ oldest.value } (${ oldest.timestamp.toLocaleDateString() })` );
        }
      } );

    } catch ( error )
    {
      console.error( '❌ Failed to show trends:', error );
    }
  }

  private async showDashboard ( jsonOutput: boolean ): Promise<void>
  {
    try
    {
      console.log( '📊 Generating system health dashboard...' );

      const dashboard = await this.reportGenerator.generateDashboardData();

      if ( jsonOutput )
      {
        console.log( JSON.stringify( dashboard, null, 2 ) );
        return;
      }

      console.log( '\n' + '='.repeat( 60 ) );
      console.log( 'SYSTEM HEALTH DASHBOARD' );
      console.log( '='.repeat( 60 ) );

      // System health
      const health = dashboard.systemHealth;
      const statusIcon = this.getStatusIcon( health.status );
      console.log( `${ statusIcon } System Status: ${ health.status }` );
      console.log( `🕐 Last Check: ${ health.lastCheck.toLocaleString() }` );
      console.log( `⚠️ Critical Issues: ${ health.criticalIssues }` );
      console.log( '' );

      // Latest report summary
      if ( dashboard.latestReport )
      {
        const latest = dashboard.latestReport;
        console.log( '📋 LATEST REPORT:' );
        console.log( `  ID: ${ latest.id }` );
        console.log( `  Timestamp: ${ latest.timestamp.toLocaleString() }` );
        console.log( `  Status: ${ latest.report.overallStatus }` );
        console.log( `  Tests: ${ latest.report.summary.passed }/${ latest.report.summary.totalTests } passed` );
        console.log( '' );
      }

      // Recent trends
      if ( dashboard.trends.length > 0 )
      {
        console.log( '📈 RECENT TRENDS:' );
        dashboard.trends.forEach( trend =>
        {
          const trendIcon = this.getTrendIcon( trend.trend );
          console.log( `  ${ trendIcon } ${ trend.metric }: ${ trend.trend } (${ trend.changePercent.toFixed( 1 ) }%)` );
        } );
        console.log( '' );
      }

      // Recent reports count
      console.log( `📚 Total Reports: ${ dashboard.recentReports.length }` );

    } catch ( error )
    {
      console.error( '❌ Failed to show dashboard:', error );
    }
  }

  private async cleanupReports ( dryRun: boolean ): Promise<void>
  {
    try
    {
      if ( dryRun )
      {
        console.log( '🧹 Dry run: Showing what would be cleaned up...' );
        // In a real implementation, you would show what would be deleted
        console.log( '💡 Use without --dry-run to actually perform cleanup' );
      } else
      {
        console.log( '🧹 Cleaning up old reports...' );
        await this.reportGenerator.cleanupOldReports();
        console.log( '✅ Cleanup completed' );
      }
    } catch ( error )
    {
      console.error( '❌ Failed to cleanup reports:', error );
    }
  }

  private async initializeStorage ( storageDir: string ): Promise<void>
  {
    try
    {
      console.log( `🏗️ Initializing report storage at: ${ storageDir }` );

      const storage = new ReportStorageManager( storageDir );
      await storage.initialize();

      console.log( '✅ Report storage initialized successfully' );
      console.log( `📁 Storage location: ${ path.resolve( storageDir ) }` );

    } catch ( error )
    {
      console.error( '❌ Failed to initialize storage:', error );
    }
  }

  private getStatusIcon ( status: string ): string
  {
    switch ( status )
    {
      case 'PASS':
      case 'HEALTHY': return '✅';
      case 'FAIL':
      case 'CRITICAL_FAILURES': return '❌';
      case 'WARNING':
      case 'ISSUES_FOUND': return '⚠️';
      default: return '❓';
    }
  }

  private getTrendIcon ( trend: string ): string
  {
    switch ( trend )
    {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }
}

// CLI entry point
export async function runReportCLI (): Promise<void>
{
  const cli = new ReportCLI();
  await cli.run( process.argv );
}

// Export for use in main CLI (already exported above)