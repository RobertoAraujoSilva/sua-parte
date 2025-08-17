// TypeScript interfaces for all verification modules

import {
  VerificationResult,
  VerificationReport,
  VerificationWarning,
  DependencyResult,
  EnvironmentResult,
  StructureResult,
  ServerResult,
  APIResult,
  ServiceResult,
  CronResult,
  AppResult,
  RoutingResult,
  ComponentResult,
  IntegrationResult,
  LoginResult,
  AccessResult,
  SessionResult,
  SupabaseAuthResult,
  JWOrgResult,
  DetectionResult,
  DownloadResult,
  OrganizationResult,
  ConnectionResult,
  CRUDResult,
  RLSResult,
  MigrationResult,
  CypressSetupResult,
  TestResult,
  CoverageResult,
  TestEnvResult,
  ScriptResult,
  BuildResult,
  EnvScriptResult,
  WorkflowResult,
  UserRole
} from './types';
export type { UserRole } from './types';

export enum VerificationModule {
  INFRASTRUCTURE = 'infrastructure',
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  AUTHENTICATION = 'authentication',
  DOWNLOAD_SYSTEM = 'download_system',
  DATABASE = 'database',
  TEST_SUITE = 'test_suite',
  SCRIPTS = 'scripts'
}

// Main verification controller interface
export interface VerificationController {
  runFullVerification(): Promise<VerificationResult[]>;
  runModuleVerification(module: VerificationModule): Promise<VerificationResult>;
  generateReport(results: VerificationResult[]): Promise<VerificationReport>;
}

// Infrastructure verification interface
export interface InfrastructureVerifier {
  checkDependencies(): Promise<DependencyResult>;
  validateEnvironment(): Promise<EnvironmentResult>;
  verifyDirectoryStructure(): Promise<StructureResult>;
}

// Backend verification interface
export interface BackendVerifier {
  startServer(): Promise<ServerResult>;
  testAPIEndpoints(): Promise<APIResult[]>;
  validateServices(): Promise<ServiceResult[]>;
  testCronJobs(): Promise<CronResult>;
}

// Frontend verification interface
export interface FrontendVerifier {
  startApplication(): Promise<AppResult>;
  testRouting(): Promise<RoutingResult[]>;
  validateComponents(): Promise<ComponentResult[]>;
  testBackendIntegration(): Promise<IntegrationResult>;
}

// Authentication verification interface
export interface AuthenticationVerifier {
  testUserLogin(role: UserRole): Promise<LoginResult>;
  validateRoleAccess(role: UserRole): Promise<AccessResult>;
  testSessionManagement(): Promise<SessionResult>;
  validateSupabaseAuth(): Promise<SupabaseAuthResult>;
}

// Download system verification interface
export interface DownloadSystemVerifier {
  validateJWOrgIntegration(): Promise<JWOrgResult>;
  testMaterialDetection(): Promise<DetectionResult>;
  validateDownloadFunctionality(): Promise<DownloadResult>;
  testFileOrganization(): Promise<OrganizationResult>;
}

// Database verification interface
export interface DatabaseVerifier {
  testConnection(): Promise<ConnectionResult>;
  validateCRUDOperations(): Promise<CRUDResult[]>;
  testRLSPolicies(): Promise<RLSResult[]>;
  validateMigrations(): Promise<MigrationResult>;
}

// Test suite verification interface
export interface TestSuiteVerifier {
  validateCypressSetup(): Promise<CypressSetupResult>;
  runAllTests(): Promise<TestResult[]>;
  analyzeTestCoverage(): Promise<CoverageResult>;
  validateTestEnvironment(): Promise<TestEnvResult>;
}

// Script verification interface
export interface ScriptVerifier {
  testDevelopmentScripts(): Promise<ScriptResult[]>;
  validateBuildProcess(): Promise<BuildResult>;
  testEnvironmentScripts(): Promise<EnvScriptResult[]>;
  validateWorkflows(): Promise<WorkflowResult>;
}

// Report generator interface
export interface ReportGenerator {
  generateReport(results: VerificationResult[]): Promise<VerificationReport>;
  saveReport(report: VerificationReport, filePath: string): Promise<void>;
  generateSummary(results: VerificationResult[]): Promise<string>;
}

// Base verifier interface that all verifiers should implement
export interface BaseVerifier {
  readonly moduleName: string;
  verify(): Promise<VerificationResult>;
  cleanup?(): Promise<void>;
}