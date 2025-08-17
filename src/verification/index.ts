// Main entry point for the verification system
export * from './interfaces';
export * from './controller';
export * from './types';
export * from './base-verifier';
export * from './utils';
export * from './cli';

// Export report storage and management
export * from './report-storage';
export * from './report-generator';
export * from './report-cli';

// Export verifier implementations
export * from './infrastructure-verifier';
export * from './backend-verifier';
export * from './frontend-verifier';
export * from './download-verifier';
export * from './database-verifier';
export * from './script-verifier';
export * from './test-suite-verifier';

// Export helper modules
export * from './routing-tester';
export * from './integration-tester';

// Setup function to initialize all verifiers
import { SystemVerificationController } from './controller';
import { VerificationModule } from './interfaces';
import { InfrastructureVerifierImpl } from './infrastructure-verifier';
import { BackendVerifierImpl } from './backend-verifier';
import { FrontendVerifierImpl } from './frontend-verifier';
import { DownloadVerifier } from './download-verifier';
import { DatabaseVerifierImpl } from './database-verifier';
import { ScriptVerifierImpl } from './script-verifier';
import { TestSuiteVerifierImpl } from './test-suite-verifier';

/**
 * Initialize the verification system with all available verifiers
 */
export function initializeVerificationSystem(): SystemVerificationController {
  const controller = new SystemVerificationController();

  // Register all available verifiers
  controller.registerVerifier(VerificationModule.INFRASTRUCTURE, new InfrastructureVerifierImpl());
  controller.registerVerifier(VerificationModule.BACKEND, new BackendVerifierImpl());
  controller.registerVerifier(VerificationModule.FRONTEND, new FrontendVerifierImpl());
  controller.registerVerifier(VerificationModule.DOWNLOAD_SYSTEM, new DownloadVerifier());
  controller.registerVerifier(VerificationModule.DATABASE, new DatabaseVerifierImpl());
  controller.registerVerifier(VerificationModule.SCRIPTS, new ScriptVerifierImpl());
  controller.registerVerifier(VerificationModule.TEST_SUITE, new TestSuiteVerifierImpl());

  return controller;
}

// Export a pre-configured instance
export const verificationSystem = initializeVerificationSystem();