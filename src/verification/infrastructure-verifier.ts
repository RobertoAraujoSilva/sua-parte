// Infrastructure verification module for dependency and environment validation

import { AbstractBaseVerifier } from './base-verifier';
import { InfrastructureVerifier } from './interfaces';
import { 
  VerificationResult, 
  DependencyResult, 
  EnvironmentResult, 
  StructureResult,
  VerificationDetail,
  VerificationStatus
} from './types';

interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
}

interface DependencyCheck {
  name: string;
  required: boolean;
  found: boolean;
  version?: string;
  expectedVersion?: string;
  location: 'dependencies' | 'devDependencies';
}

interface EnvironmentVariable {
  name: string;
  required: boolean;
  found: boolean;
  value?: string;
  masked?: boolean;
  validation?: (value: string) => boolean;
}

export class InfrastructureVerifierImpl extends AbstractBaseVerifier implements InfrastructureVerifier {
  public readonly moduleName = 'infrastructure';

  // Critical dependencies that must be present
  private readonly criticalDependencies = {
    frontend: {
      dependencies: [
        { name: 'react', required: true },
        { name: 'react-dom', required: true },
        { name: '@supabase/supabase-js', required: true },
        { name: 'react-router-dom', required: true },
        { name: 'vite', required: false, location: 'devDependencies' as const }
      ],
      devDependencies: [
        { name: 'typescript', required: true },
        { name: 'vite', required: true },
        { name: '@vitejs/plugin-react', required: true },
        { name: 'cypress', required: true }
      ]
    },
    backend: {
      dependencies: [
        { name: 'express', required: true },
        { name: 'node-cron', required: true },
        { name: 'cheerio', required: true },
        { name: '@supabase/supabase-js', required: true },
        { name: 'cors', required: true },
        { name: 'helmet', required: true }
      ],
      devDependencies: [
        { name: 'nodemon', required: true }
      ]
    }
  };

  // Required environment variables
  private readonly requiredEnvVars: EnvironmentVariable[] = [
    {
      name: 'VITE_SUPABASE_URL',
      required: true,
      found: false,
      validation: (value) => value.startsWith('https://') && value.includes('.supabase.co')
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      required: true,
      found: false,
      masked: true,
      validation: (value) => value.length > 100 && value.startsWith('eyJ')
    },
    {
      name: 'DATABASE_URL',
      required: true,
      found: false,
      masked: true,
      validation: (value) => value.startsWith('postgresql://') || value.startsWith('postgres://')
    },
    {
      name: 'CYPRESS_RECORD_KEY',
      required: false,
      found: false,
      masked: true
    },
    {
      name: 'CYPRESS_INSTRUCTOR_EMAIL',
      required: false,
      found: false,
      validation: (value) => value.includes('@') && value.includes('.')
    },
    {
      name: 'CYPRESS_STUDENT_EMAIL',
      required: false,
      found: false,
      validation: (value) => value.includes('@') && value.includes('.')
    }
  ];

  // Required directory structure
  private readonly requiredDirectories = [
    'src',
    'src/components',
    'src/pages',
    'src/hooks',
    'src/utils',
    'src/types',
    'backend',
    'backend/routes',
    'backend/services',
    'cypress',
    'cypress/e2e',
    'public'
  ];

  public async verify(): Promise<VerificationResult> {
    this.log('Starting infrastructure verification...');
    
    const startTime = Date.now();
    const details: VerificationDetail[] = [];
    const errors: Error[] = [];

    try {
      // Run all verification checks
      const dependencyResult = await this.checkDependencies();
      const environmentResult = await this.validateEnvironment();
      const structureResult = await this.verifyDirectoryStructure();

      // Combine all details
      details.push(...dependencyResult.details);
      details.push(...environmentResult.details);
      details.push(...structureResult.details);

      // Collect errors
      if (dependencyResult.errors) errors.push(...dependencyResult.errors);
      if (environmentResult.errors) errors.push(...environmentResult.errors);
      if (structureResult.errors) errors.push(...structureResult.errors);

      // Determine overall status
      const hasFailures = details.some(d => d.result === 'FAIL');
      const hasCriticalFailures = details.some(d => 
        d.result === 'FAIL' && 
        (d.component.includes('critical') || d.test.includes('required'))
      );

      const status: VerificationStatus = hasCriticalFailures ? 'FAIL' : 
                                       hasFailures ? 'WARNING' : 'PASS';

      const duration = Date.now() - startTime;
      this.log(`Infrastructure verification completed in ${duration}ms with status: ${status}`);

      return {
        module: this.moduleName,
        status,
        timestamp: new Date(),
        duration,
        details,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.log(`Infrastructure verification failed: ${errorObj.message}`, 'error');
      
      return {
        module: this.moduleName,
        status: 'FAIL',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        details: [
          this.createDetail(
            'infrastructure',
            'verification_execution',
            'FAIL',
            `Verification execution failed: ${errorObj.message}`
          )
        ],
        errors: [errorObj]
      };
    }
  }

  public async checkDependencies(): Promise<DependencyResult> {
    this.log('Checking dependencies...');
    
    const details: VerificationDetail[] = [];
    const errors: Error[] = [];
    const missingDependencies: string[] = [];
    const versionConflicts: string[] = [];

    try {
      // Check frontend package.json
      const frontendCheck = await this.checkPackageJson('./', 'frontend');
      details.push(...frontendCheck.details);
      missingDependencies.push(...frontendCheck.missing);
      versionConflicts.push(...frontendCheck.conflicts);

      // Check backend package.json
      const backendCheck = await this.checkPackageJson('./backend/', 'backend');
      details.push(...backendCheck.details);
      missingDependencies.push(...backendCheck.missing);
      versionConflicts.push(...backendCheck.conflicts);

      // Check Node.js version compatibility
      const nodeVersionCheck = await this.checkNodeVersion();
      details.push(nodeVersionCheck);

      // Check npm availability
      const npmCheck = await this.checkNpmAvailability();
      details.push(npmCheck);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errors.push(errorObj);
      details.push(
        this.createDetail(
          'dependencies',
          'dependency_check_execution',
          'FAIL',
          `Dependency check failed: ${errorObj.message}`
        )
      );
    }

    return {
      module: this.moduleName,
      status: missingDependencies.length > 0 || versionConflicts.length > 0 ? 'FAIL' : 'PASS',
      timestamp: new Date(),
      duration: 0,
      details,
      errors: errors.length > 0 ? errors : undefined,
      missingDependencies: missingDependencies.length > 0 ? missingDependencies : undefined,
      versionConflicts: versionConflicts.length > 0 ? versionConflicts : undefined
    };
  }

  public async validateEnvironment(): Promise<EnvironmentResult> {
    this.log('Validating environment configuration...');
    
    const details: VerificationDetail[] = [];
    const errors: Error[] = [];
    const missingVariables: string[] = [];
    const invalidVariables: string[] = [];

    try {
      // Check environment variables
      for (const envVar of this.requiredEnvVars) {
        const value = this.getEnvironmentVariable(envVar.name);
        envVar.found = !!value;
        envVar.value = value;

        if (!value && envVar.required) {
          missingVariables.push(envVar.name);
          details.push(
            this.createDetail(
              'environment',
              `env_var_${envVar.name}`,
              'FAIL',
              `Required environment variable ${envVar.name} is missing`
            )
          );
        } else if (value && envVar.validation && !envVar.validation(value)) {
          invalidVariables.push(envVar.name);
          details.push(
            this.createDetail(
              'environment',
              `env_var_${envVar.name}`,
              'FAIL',
              `Environment variable ${envVar.name} has invalid format`
            )
          );
        } else if (value) {
          const displayValue = envVar.masked ? '[MASKED]' : value;
          details.push(
            this.createDetail(
              'environment',
              `env_var_${envVar.name}`,
              'PASS',
              `Environment variable ${envVar.name} is properly configured`,
              { value: displayValue, required: envVar.required }
            )
          );
        } else {
          // Optional variable not set
          details.push(
            this.createDetail(
              'environment',
              `env_var_${envVar.name}`,
              'WARNING',
              `Optional environment variable ${envVar.name} is not set`,
              { required: envVar.required }
            )
          );
        }
      }

      // Check for .env file existence
      const envFileCheck = await this.checkEnvFile();
      details.push(envFileCheck);

      // Check configuration files
      const configChecks = await this.checkConfigurationFiles();
      details.push(...configChecks);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errors.push(errorObj);
      details.push(
        this.createDetail(
          'environment',
          'environment_validation_execution',
          'FAIL',
          `Environment validation failed: ${errorObj.message}`
        )
      );
    }

    return {
      module: this.moduleName,
      status: missingVariables.length > 0 || invalidVariables.length > 0 ? 'FAIL' : 'PASS',
      timestamp: new Date(),
      duration: 0,
      details,
      errors: errors.length > 0 ? errors : undefined,
      missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
      invalidVariables: invalidVariables.length > 0 ? invalidVariables : undefined
    };
  }

  public async verifyDirectoryStructure(): Promise<StructureResult> {
    this.log('Verifying directory structure...');
    
    const details: VerificationDetail[] = [];
    const errors: Error[] = [];
    const missingDirectories: string[] = [];
    const permissionIssues: string[] = [];

    try {
      // Check required directories
      for (const dir of this.requiredDirectories) {
        try {
          const exists = await this.checkDirectoryExists(dir);
          
          if (exists) {
            details.push(
              this.createDetail(
                'structure',
                `directory_${dir.replace(/[\/\\]/g, '_')}`,
                'PASS',
                `Directory ${dir} exists`,
                { path: dir }
              )
            );
          } else {
            missingDirectories.push(dir);
            details.push(
              this.createDetail(
                'structure',
                `directory_${dir.replace(/[\/\\]/g, '_')}`,
                'FAIL',
                `Required directory ${dir} is missing`,
                { path: dir }
              )
            );
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          permissionIssues.push(dir);
          details.push(
            this.createDetail(
              'structure',
              `directory_${dir.replace(/[\/\\]/g, '_')}`,
              'FAIL',
              `Cannot access directory ${dir}: ${errorMsg}`,
              { path: dir, error: errorMsg }
            )
          );
        }
      }

      // Check key files
      const keyFiles = [
        'package.json',
        'backend/package.json',
        'vite.config.ts',
        'tsconfig.json',
        'tailwind.config.ts',
        'cypress.config.mjs'
      ];

      for (const file of keyFiles) {
        try {
          const exists = await this.checkFileExists(file);
          
          details.push(
            this.createDetail(
              'structure',
              `file_${file.replace(/[\/\\\.]/g, '_')}`,
              exists ? 'PASS' : 'FAIL',
              exists ? `Key file ${file} exists` : `Key file ${file} is missing`,
              { path: file, exists }
            )
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          details.push(
            this.createDetail(
              'structure',
              `file_${file.replace(/[\/\\\.]/g, '_')}`,
              'FAIL',
              `Cannot check file ${file}: ${errorMsg}`,
              { path: file, error: errorMsg }
            )
          );
        }
      }

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errors.push(errorObj);
      details.push(
        this.createDetail(
          'structure',
          'structure_verification_execution',
          'FAIL',
          `Structure verification failed: ${errorObj.message}`
        )
      );
    }

    return {
      module: this.moduleName,
      status: missingDirectories.length > 0 || permissionIssues.length > 0 ? 'FAIL' : 'PASS',
      timestamp: new Date(),
      duration: 0,
      details,
      errors: errors.length > 0 ? errors : undefined,
      missingDirectories: missingDirectories.length > 0 ? missingDirectories : undefined,
      permissionIssues: permissionIssues.length > 0 ? permissionIssues : undefined
    };
  }

  // Helper methods

  private async checkPackageJson(
    basePath: string, 
    type: 'frontend' | 'backend'
  ): Promise<{ details: VerificationDetail[]; missing: string[]; conflicts: string[] }> {
    const details: VerificationDetail[] = [];
    const missing: string[] = [];
    const conflicts: string[] = [];

    try {
      const packageJsonPath = `${basePath}package.json`;
      const packageJson = await this.loadPackageJson(packageJsonPath);
      
      if (!packageJson) {
        details.push(
          this.createDetail(
            'dependencies',
            `package_json_${type}`,
            'FAIL',
            `package.json not found at ${packageJsonPath}`
          )
        );
        return { details, missing, conflicts };
      }

      details.push(
        this.createDetail(
          'dependencies',
          `package_json_${type}`,
          'PASS',
          `package.json found for ${type}`,
          { name: packageJson.name, version: packageJson.version }
        )
      );

      // Check dependencies
      const expectedDeps = this.criticalDependencies[type];
      
      // Check regular dependencies
      if (expectedDeps.dependencies) {
        for (const dep of expectedDeps.dependencies) {
          const found = packageJson.dependencies?.[dep.name];
          
          if (dep.required && !found) {
            missing.push(`${type}:${dep.name}`);
            details.push(
              this.createDetail(
                'dependencies',
                `${type}_dep_${dep.name}`,
                'FAIL',
                `Required dependency ${dep.name} is missing from ${type}`,
                { dependency: dep.name, type, location: 'dependencies' }
              )
            );
          } else if (found) {
            details.push(
              this.createDetail(
                'dependencies',
                `${type}_dep_${dep.name}`,
                'PASS',
                `Dependency ${dep.name} found in ${type}`,
                { dependency: dep.name, version: found, type, location: 'dependencies' }
              )
            );
          }
        }
      }

      // Check dev dependencies
      if (expectedDeps.devDependencies) {
        for (const dep of expectedDeps.devDependencies) {
          const found = packageJson.devDependencies?.[dep.name];
          
          if (dep.required && !found) {
            missing.push(`${type}:${dep.name}`);
            details.push(
              this.createDetail(
                'dependencies',
                `${type}_devdep_${dep.name}`,
                'FAIL',
                `Required dev dependency ${dep.name} is missing from ${type}`,
                { dependency: dep.name, type, location: 'devDependencies' }
              )
            );
          } else if (found) {
            details.push(
              this.createDetail(
                'dependencies',
                `${type}_devdep_${dep.name}`,
                'PASS',
                `Dev dependency ${dep.name} found in ${type}`,
                { dependency: dep.name, version: found, type, location: 'devDependencies' }
              )
            );
          }
        }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      details.push(
        this.createDetail(
          'dependencies',
          `package_json_${type}_check`,
          'FAIL',
          `Failed to check ${type} package.json: ${errorMsg}`
        )
      );
    }

    return { details, missing, conflicts };
  }

  private async loadPackageJson(path: string): Promise<PackageJson | null> {
    try {
      // In a browser environment, we'll try to fetch the package.json
      const response = await fetch(path);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      // Fallback: return null if we can't load it
      return null;
    }
  }

  private async checkNodeVersion(): Promise<VerificationDetail> {
    try {
      // In browser environment, we can't directly check Node.js version
      // This would need to be implemented differently in a Node.js environment
      return this.createDetail(
        'dependencies',
        'node_version',
        'WARNING',
        'Node.js version check not available in browser environment',
        { note: 'This check should be run in Node.js environment' }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'dependencies',
        'node_version',
        'FAIL',
        `Failed to check Node.js version: ${errorMsg}`
      );
    }
  }

  private async checkNpmAvailability(): Promise<VerificationDetail> {
    try {
      // In browser environment, we can't directly check npm availability
      return this.createDetail(
        'dependencies',
        'npm_availability',
        'WARNING',
        'npm availability check not available in browser environment',
        { note: 'This check should be run in Node.js environment' }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'dependencies',
        'npm_availability',
        'FAIL',
        `Failed to check npm availability: ${errorMsg}`
      );
    }
  }

  private getEnvironmentVariable(name: string): string | undefined {
    // In browser environment, only VITE_ prefixed variables are available
    if (typeof window !== 'undefined') {
      // Browser environment - check import.meta.env
      return (import.meta.env as any)[name];
    } else {
      // Node.js environment - check process.env
      return process.env[name];
    }
  }

  private async checkEnvFile(): Promise<VerificationDetail> {
    try {
      const exists = await this.checkFileExists('.env');
      
      return this.createDetail(
        'environment',
        'env_file',
        exists ? 'PASS' : 'WARNING',
        exists ? '.env file exists' : '.env file not found (may be using system environment variables)',
        { exists }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'env_file',
        'FAIL',
        `Failed to check .env file: ${errorMsg}`
      );
    }
  }

  private async checkConfigurationFiles(): Promise<VerificationDetail[]> {
    const details: VerificationDetail[] = [];
    
    const configFiles = [
      { 
        path: 'vite.config.ts', 
        name: 'Vite configuration',
        validator: this.validateViteConfig.bind(this)
      },
      { 
        path: 'tailwind.config.ts', 
        name: 'Tailwind configuration',
        validator: this.validateTailwindConfig.bind(this)
      },
      { 
        path: 'tsconfig.json', 
        name: 'TypeScript configuration',
        validator: this.validateTSConfig.bind(this)
      },
      { 
        path: 'cypress.config.mjs', 
        name: 'Cypress configuration',
        validator: this.validateCypressConfig.bind(this)
      },
      { 
        path: 'backend/config', 
        name: 'Backend configuration directory'
      }
    ];

    for (const config of configFiles) {
      try {
        const exists = await this.checkFileExists(config.path);
        
        if (exists) {
          details.push(
            this.createDetail(
              'environment',
              `config_${config.path.replace(/[\/\\\.]/g, '_')}_exists`,
              'PASS',
              `${config.name} exists`,
              { path: config.path, exists: true }
            )
          );

          // If validator exists, run configuration validation
          if (config.validator) {
            try {
              const validationResult = await config.validator(config.path);
              details.push(validationResult);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              details.push(
                this.createDetail(
                  'environment',
                  `config_${config.path.replace(/[\/\\\.]/g, '_')}_validation`,
                  'FAIL',
                  `Failed to validate ${config.name}: ${errorMsg}`,
                  { path: config.path, error: errorMsg }
                )
              );
            }
          }
        } else {
          details.push(
            this.createDetail(
              'environment',
              `config_${config.path.replace(/[\/\\\.]/g, '_')}_exists`,
              'WARNING',
              `${config.name} not found`,
              { path: config.path, exists: false }
            )
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        details.push(
          this.createDetail(
            'environment',
            `config_${config.path.replace(/[\/\\\.]/g, '_')}_check`,
            'FAIL',
            `Failed to check ${config.name}: ${errorMsg}`,
            { path: config.path, error: errorMsg }
          )
        );
      }
    }

    // Check Supabase configuration
    const supabaseConfigCheck = await this.validateSupabaseConfiguration();
    details.push(supabaseConfigCheck);

    return details;
  }

  private async validateViteConfig(configPath: string): Promise<VerificationDetail> {
    try {
      // In a real implementation, you would parse and validate the Vite config
      // For now, we'll do basic checks
      const configContent = await this.loadConfigFile(configPath);
      
      if (!configContent) {
        return this.createDetail(
          'environment',
          'vite_config_validation',
          'FAIL',
          'Could not load Vite configuration content'
        );
      }

      const checks = [
        { 
          condition: configContent.includes('@vitejs/plugin-react'),
          message: 'React plugin configured'
        },
        {
          condition: configContent.includes('port: 8080'),
          message: 'Development server port configured to 8080'
        },
        {
          condition: configContent.includes('alias'),
          message: 'Path aliases configured'
        }
      ];

      const failedChecks = checks.filter(check => !check.condition);
      
      if (failedChecks.length === 0) {
        return this.createDetail(
          'environment',
          'vite_config_validation',
          'PASS',
          'Vite configuration is properly set up',
          { checks: checks.map(c => c.message) }
        );
      } else {
        return this.createDetail(
          'environment',
          'vite_config_validation',
          'WARNING',
          `Vite configuration has potential issues: ${failedChecks.map(c => c.message).join(', ')}`,
          { 
            passedChecks: checks.filter(c => c.condition).map(c => c.message),
            failedChecks: failedChecks.map(c => c.message)
          }
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'vite_config_validation',
        'FAIL',
        `Failed to validate Vite configuration: ${errorMsg}`
      );
    }
  }

  private async validateTailwindConfig(configPath: string): Promise<VerificationDetail> {
    try {
      const configContent = await this.loadConfigFile(configPath);
      
      if (!configContent) {
        return this.createDetail(
          'environment',
          'tailwind_config_validation',
          'FAIL',
          'Could not load Tailwind configuration content'
        );
      }

      const checks = [
        {
          condition: configContent.includes('darkMode'),
          message: 'Dark mode configuration present'
        },
        {
          condition: configContent.includes('./src/**/*.{ts,tsx}'),
          message: 'Content paths include src directory'
        },
        {
          condition: configContent.includes('tailwindcss-animate'),
          message: 'Animation plugin configured'
        }
      ];

      const failedChecks = checks.filter(check => !check.condition);
      
      if (failedChecks.length === 0) {
        return this.createDetail(
          'environment',
          'tailwind_config_validation',
          'PASS',
          'Tailwind configuration is properly set up',
          { checks: checks.map(c => c.message) }
        );
      } else {
        return this.createDetail(
          'environment',
          'tailwind_config_validation',
          'WARNING',
          `Tailwind configuration has potential issues: ${failedChecks.map(c => c.message).join(', ')}`,
          { 
            passedChecks: checks.filter(c => c.condition).map(c => c.message),
            failedChecks: failedChecks.map(c => c.message)
          }
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'tailwind_config_validation',
        'FAIL',
        `Failed to validate Tailwind configuration: ${errorMsg}`
      );
    }
  }

  private async validateTSConfig(configPath: string): Promise<VerificationDetail> {
    try {
      const configContent = await this.loadConfigFile(configPath);
      
      if (!configContent) {
        return this.createDetail(
          'environment',
          'tsconfig_validation',
          'FAIL',
          'Could not load TypeScript configuration content'
        );
      }

      const checks = [
        {
          condition: configContent.includes('"target"'),
          message: 'Compilation target specified'
        },
        {
          condition: configContent.includes('"module"'),
          message: 'Module system specified'
        },
        {
          condition: configContent.includes('"strict"'),
          message: 'Strict mode configuration present'
        }
      ];

      const failedChecks = checks.filter(check => !check.condition);
      
      if (failedChecks.length === 0) {
        return this.createDetail(
          'environment',
          'tsconfig_validation',
          'PASS',
          'TypeScript configuration is properly set up',
          { checks: checks.map(c => c.message) }
        );
      } else {
        return this.createDetail(
          'environment',
          'tsconfig_validation',
          'WARNING',
          `TypeScript configuration has potential issues: ${failedChecks.map(c => c.message).join(', ')}`,
          { 
            passedChecks: checks.filter(c => c.condition).map(c => c.message),
            failedChecks: failedChecks.map(c => c.message)
          }
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'tsconfig_validation',
        'FAIL',
        `Failed to validate TypeScript configuration: ${errorMsg}`
      );
    }
  }

  private async validateCypressConfig(configPath: string): Promise<VerificationDetail> {
    try {
      const configContent = await this.loadConfigFile(configPath);
      
      if (!configContent) {
        return this.createDetail(
          'environment',
          'cypress_config_validation',
          'FAIL',
          'Could not load Cypress configuration content'
        );
      }

      const checks = [
        {
          condition: configContent.includes('projectId'),
          message: 'Cypress Cloud project ID configured'
        },
        {
          condition: configContent.includes('baseUrl'),
          message: 'Base URL configured'
        },
        {
          condition: configContent.includes('INSTRUCTOR_EMAIL'),
          message: 'Test credentials configured'
        },
        {
          condition: configContent.includes('viewportWidth'),
          message: 'Viewport dimensions configured'
        }
      ];

      const failedChecks = checks.filter(check => !check.condition);
      
      if (failedChecks.length === 0) {
        return this.createDetail(
          'environment',
          'cypress_config_validation',
          'PASS',
          'Cypress configuration is properly set up',
          { checks: checks.map(c => c.message) }
        );
      } else {
        return this.createDetail(
          'environment',
          'cypress_config_validation',
          'WARNING',
          `Cypress configuration has potential issues: ${failedChecks.map(c => c.message).join(', ')}`,
          { 
            passedChecks: checks.filter(c => c.condition).map(c => c.message),
            failedChecks: failedChecks.map(c => c.message)
          }
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'cypress_config_validation',
        'FAIL',
        `Failed to validate Cypress configuration: ${errorMsg}`
      );
    }
  }

  private async validateSupabaseConfiguration(): Promise<VerificationDetail> {
    try {
      const supabaseUrl = this.getEnvironmentVariable('VITE_SUPABASE_URL');
      const supabaseKey = this.getEnvironmentVariable('VITE_SUPABASE_ANON_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        return this.createDetail(
          'environment',
          'supabase_config_validation',
          'FAIL',
          'Supabase configuration is incomplete - missing URL or anonymous key'
        );
      }

      const checks = [
        {
          condition: supabaseUrl.startsWith('https://'),
          message: 'Supabase URL uses HTTPS'
        },
        {
          condition: supabaseUrl.includes('.supabase.co'),
          message: 'Supabase URL has correct domain'
        },
        {
          condition: supabaseKey.startsWith('eyJ'),
          message: 'Anonymous key has JWT format'
        },
        {
          condition: supabaseKey.length > 100,
          message: 'Anonymous key has appropriate length'
        }
      ];

      const failedChecks = checks.filter(check => !check.condition);
      
      if (failedChecks.length === 0) {
        return this.createDetail(
          'environment',
          'supabase_config_validation',
          'PASS',
          'Supabase configuration is properly set up',
          { 
            url: supabaseUrl,
            keyLength: supabaseKey.length,
            checks: checks.map(c => c.message)
          }
        );
      } else {
        return this.createDetail(
          'environment',
          'supabase_config_validation',
          'FAIL',
          `Supabase configuration has issues: ${failedChecks.map(c => c.message).join(', ')}`,
          { 
            url: supabaseUrl,
            keyLength: supabaseKey.length,
            passedChecks: checks.filter(c => c.condition).map(c => c.message),
            failedChecks: failedChecks.map(c => c.message)
          }
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return this.createDetail(
        'environment',
        'supabase_config_validation',
        'FAIL',
        `Failed to validate Supabase configuration: ${errorMsg}`
      );
    }
  }

  private async loadConfigFile(filePath: string): Promise<string | null> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        return null;
      }
      return await response.text();
    } catch {
      return null;
    }
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkDirectoryExists(dirPath: string): Promise<boolean> {
    try {
      // In browser environment, we can try to fetch a directory listing
      // This is a simplified check - in a real Node.js environment,
      // you would use fs.stat or fs.access
      const response = await fetch(dirPath + '/', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}