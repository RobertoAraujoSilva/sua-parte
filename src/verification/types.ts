// Core data models and types for the verification system

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARNING';
export type OverallStatus = 'HEALTHY' | 'ISSUES_FOUND' | 'CRITICAL_FAILURES';
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'admin' | 'instructor' | 'student';

export interface VerificationDetail {
  component: string;
  test: string;
  result: VerificationStatus;
  message: string;
  data?: any;
}

export interface VerificationWarning {
  message: string;
  component?: string;
  data?: any;
}

export interface VerificationResult {
  module: string;
  status: VerificationStatus;
  timestamp: Date;
  duration: number;
  details: VerificationDetail[];
  errors?: Error[];
  warnings?: VerificationWarning[];
}

export interface VerificationSummary {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: number;
}

export interface Recommendation {
  severity: ErrorSeverity;
  component: string;
  issue: string;
  solution: string;
  documentation?: string;
}

export interface VerificationReport {
  overallStatus: OverallStatus;
  timestamp: Date;
  totalDuration: number;
  summary: VerificationSummary;
  moduleResults: VerificationResult[];
  recommendations: Recommendation[];
}

export interface RemediationStep {
  step: number;
  description: string;
  command?: string;
  expectedResult: string;
  documentation?: string;
}

export interface ErrorReport {
  errorId: string;
  severity: ErrorSeverity;
  component: string;
  message: string;
  stackTrace?: string;
  context: Record<string, any>;
  timestamp: Date;
  remediation: RemediationStep[];
}

// Module-specific result types
export interface DependencyResult extends VerificationResult {
  missingDependencies?: string[];
  versionConflicts?: string[];
}

export interface EnvironmentResult extends VerificationResult {
  missingVariables?: string[];
  invalidVariables?: string[];
}

export interface StructureResult extends VerificationResult {
  missingDirectories?: string[];
  permissionIssues?: string[];
}

export interface ServerResult extends VerificationResult {
  port?: number;
  processId?: number;
}

export interface APIResult extends VerificationResult {
  endpoint: string;
  statusCode?: number;
  responseTime?: number;
}

export interface ServiceResult extends VerificationResult {
  serviceName: string;
  initialized: boolean;
}

export interface CronResult extends VerificationResult {
  scheduledJobs?: string[];
}

export interface AppResult extends VerificationResult {
  port?: number;
  buildTime?: number;
}

export interface RoutingResult extends VerificationResult {
  route: string;
  accessible: boolean;
}

export interface ComponentResult extends VerificationResult {
  componentName: string;
  rendered: boolean;
}

export interface IntegrationResult extends VerificationResult {
  apiEndpoint: string;
  connected: boolean;
}

export interface LoginResult extends VerificationResult {
  role: UserRole;
  authenticated: boolean;
}

export interface AccessResult extends VerificationResult {
  role: UserRole;
  allowedFeatures: string[];
  deniedFeatures: string[];
}

export interface SessionResult extends VerificationResult {
  persistent: boolean;
  timeoutHandled: boolean;
}

export interface SupabaseAuthResult extends VerificationResult {
  configured: boolean;
  connected: boolean;
}

export interface JWOrgResult extends VerificationResult {
  urlsAccessible: boolean;
  configurationValid: boolean;
}

export interface DetectionResult extends VerificationResult {
  materialsDetected: number;
  parsingSuccessful: boolean;
}

export interface DownloadResult extends VerificationResult {
  filesDownloaded: number;
  downloadPath: string;
}

export interface OrganizationResult extends VerificationResult {
  properlyOrganized: boolean;
  directoryStructure: string[];
}

export interface ConnectionResult extends VerificationResult {
  connected: boolean;
  authenticated: boolean;
}

export interface CRUDResult extends VerificationResult {
  entity: string;
  operations: Record<string, boolean>;
}

export interface RLSResult extends VerificationResult {
  policy: string;
  enforced: boolean;
}

export interface MigrationResult extends VerificationResult {
  appliedMigrations: string[];
  pendingMigrations: string[];
}

export interface CypressSetupResult {
  isValid: boolean;
  message: string;
  checks: Record<string, boolean>;
  issues: string[];
  fixes: string[];
  configPath: string | null;
  version: string | null;
}

export interface TestResult extends VerificationResult {
  testFile: string;
  passed: boolean;
}

export interface CoverageResult extends VerificationResult {
  percentage: number;
  uncoveredComponents: string[];
}

export interface TestEnvResult {
  isValid: boolean;
  message: string;
  checks: Record<string, boolean>;
  issues: string[];
  warnings: string[];
  environmentVariables: Record<string, boolean>;
}

export interface ScriptResult extends VerificationResult {
  scriptName: string;
  exitCode: number;
  output?: string;
}

export interface BuildResult extends VerificationResult {
  successful: boolean;
  artifacts: string[];
}

export interface EnvScriptResult extends VerificationResult {
  scriptName: string;
  variablesValidated: string[];
}

export interface WorkflowResult extends VerificationResult {
  workflowName: string;
  stepsCompleted: number;
  totalSteps: number;
}

export interface AuthenticationResult {
  component: string;
  test: string;
  success: boolean;
  message: string;
  data?: any;
  warnings?: string[];
}