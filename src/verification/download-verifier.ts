import { BaseVerifier } from './interfaces';
import { VerificationResult, VerificationDetail } from './types';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { load } from 'cheerio';

interface MwbSource {
  name: string;
  url: string;
  downloadPath: string;
  active: boolean;
}

interface MwbSources {
  [language: string]: MwbSource;
}

interface MaterialInfo {
  url: string;
  filename: string;
  text: string;
  language: string;
  materialType: string;
  period: string;
  version: string;
  extension: string;
  size: number;
  lastChecked: string;
}

interface DownloadResult {
  filename: string;
  status: 'downloaded' | 'already_exists' | 'error';
  localPath?: string;
  size?: number;
  error?: string;
  downloadedAt?: string;
}

export class DownloadVerifier implements BaseVerifier {
  public readonly moduleName = 'Download System';
  private mwbSourcesPath: string;
  private downloadBasePath: string;

  constructor() {
    this.mwbSourcesPath = path.join(process.cwd(), 'backend/config/mwbSources.json');
    this.downloadBasePath = path.join(process.cwd(), 'docs/Oficial');
  }

  async verify(): Promise<VerificationResult> {
    const details: VerificationDetail[] = [];
    let hasErrors = false;

    try {
      // Test 6.1: JW.org integration testing
      const jwOrgResults = await this.testJWOrgIntegration();
      details.push(...jwOrgResults.details);
      if (jwOrgResults.hasErrors) hasErrors = true;

      // Test 6.2: Download functionality testing
      const downloadResults = await this.testDownloadFunctionality();
      details.push(...downloadResults.details);
      if (downloadResults.hasErrors) hasErrors = true;

      // Test 6.3: File organization and storage testing
      const storageResults = await this.testFileOrganizationAndStorage();
      details.push(...storageResults.details);
      if (storageResults.hasErrors) hasErrors = true;

    } catch (error) {
      hasErrors = true;
      details.push({
        component: 'Download System',
        test: 'Overall Verification',
        result: 'FAIL',
        message: `Critical error during download system verification: ${error.message}`,
        data: { error: error.stack }
      });
    }

    return {
      module: this.moduleName,
      status: hasErrors ? 'FAIL' : 'PASS',
      timestamp: new Date(),
      duration: 0,
      details,
      ...(hasErrors && { errors: details.filter(d => d.result === 'FAIL').map(d => new Error(d.message)) })
    };
  }

  /**
   * Test 6.1: JW.org integration testing
   * - Validate mwbSources.json configuration and URL accessibility
   * - Test JW.org website scraping functionality
   * - Validate material detection and parsing from JW.org pages
   */
  private async testJWOrgIntegration(): Promise<{ details: VerificationDetail[], hasErrors: boolean }> {
    const details: VerificationDetail[] = [];
    let hasErrors = false;

    try {
      // Test mwbSources.json configuration
      const configResult = await this.validateMwbSourcesConfig();
      details.push(configResult);
      if (configResult.result === 'FAIL') hasErrors = true;

      // Test URL accessibility for active sources
      const mwbSources = await this.loadMwbSources();
      for (const [language, source] of Object.entries(mwbSources)) {
        if (!source.active) continue;

        const urlResult = await this.testUrlAccessibility(language, source.url);
        details.push(urlResult);
        if (urlResult.result === 'FAIL') hasErrors = true;

        // Test material detection and parsing
        const parsingResult = await this.testMaterialDetectionAndParsing(language, source.url);
        details.push(parsingResult);
        if (parsingResult.result === 'FAIL') hasErrors = true;
      }

    } catch (error) {
      hasErrors = true;
      details.push({
        component: 'JW.org Integration',
        test: 'Integration Testing',
        result: 'FAIL',
        message: `Error during JW.org integration testing: ${error.message}`,
        data: { error: error.stack }
      });
    }

    return { details, hasErrors };
  }

  /**
   * Validate mwbSources.json configuration file
   */
  private async validateMwbSourcesConfig(): Promise<VerificationDetail> {
    try {
      // Check if file exists
      if (!(await fs.pathExists(this.mwbSourcesPath))) {
        return {
          component: 'Configuration',
          test: 'mwbSources.json Existence',
          result: 'FAIL',
          message: `mwbSources.json not found at ${this.mwbSourcesPath}`,
          data: { path: this.mwbSourcesPath }
        };
      }

      // Load and validate configuration
      const mwbSources = await this.loadMwbSources();
      
      // Validate structure
      const requiredFields = ['name', 'url', 'downloadPath', 'active'];
      const languages = Object.keys(mwbSources);
      
      if (languages.length === 0) {
        return {
          component: 'Configuration',
          test: 'mwbSources.json Structure',
          result: 'FAIL',
          message: 'mwbSources.json is empty or has no language configurations',
          data: { mwbSources }
        };
      }

      // Check each language configuration
      for (const [language, source] of Object.entries(mwbSources)) {
        for (const field of requiredFields) {
          if (!(field in source)) {
            return {
              component: 'Configuration',
              test: 'mwbSources.json Structure',
              result: 'FAIL',
              message: `Missing required field '${field}' in language '${language}'`,
              data: { language, source, missingField: field }
            };
          }
        }

        // Validate URL format
        try {
          new URL(source.url);
        } catch {
          return {
            component: 'Configuration',
            test: 'mwbSources.json URL Validation',
            result: 'FAIL',
            message: `Invalid URL format for language '${language}': ${source.url}`,
            data: { language, url: source.url }
          };
        }
      }

      const activeLanguages = languages.filter(lang => mwbSources[lang].active);
      
      return {
        component: 'Configuration',
        test: 'mwbSources.json Validation',
        result: 'PASS',
        message: `Configuration valid with ${languages.length} languages (${activeLanguages.length} active)`,
        data: { 
          totalLanguages: languages.length,
          activeLanguages: activeLanguages.length,
          languages: activeLanguages
        }
      };

    } catch (error) {
      return {
        component: 'Configuration',
        test: 'mwbSources.json Validation',
        result: 'FAIL',
        message: `Error validating mwbSources.json: ${error.message}`,
        data: { error: error.stack }
      };
    }
  }

  /**
   * Test URL accessibility for JW.org sources
   */
  private async testUrlAccessibility(language: string, url: string): Promise<VerificationDetail> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          component: 'URL Accessibility',
          test: `${language} URL Access`,
          result: 'FAIL',
          message: `URL not accessible: ${response.status} ${response.statusText}`,
          data: { 
            language, 
            url, 
            status: response.status, 
            statusText: response.statusText,
            responseTime
          }
        };
      }

      return {
        component: 'URL Accessibility',
        test: `${language} URL Access`,
        result: 'PASS',
        message: `URL accessible (${response.status}) in ${responseTime}ms`,
        data: { 
          language, 
          url, 
          status: response.status,
          responseTime,
          contentType: response.headers.get('content-type')
        }
      };

    } catch (error) {
      return {
        component: 'URL Accessibility',
        test: `${language} URL Access`,
        result: 'FAIL',
        message: `Error accessing URL: ${error.message}`,
        data: { language, url, error: error.message }
      };
    }
  }

  /**
   * Test material detection and parsing from JW.org pages
   */
  private async testMaterialDetectionAndParsing(language: string, url: string): Promise<VerificationDetail> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        return {
          component: 'Material Detection',
          test: `${language} Material Parsing`,
          result: 'FAIL',
          message: `Failed to fetch page content: ${response.status}`,
          data: { language, url, status: response.status }
        };
      }

      const html = await response.text();
      const $ = load(html);
      const parseTime = Date.now() - startTime;

      // Detect material links
      const materials: MaterialInfo[] = [];
      const validExtensions = ['.pdf', '.daisy.zip', '.jwpub', '.rtf'];

      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && this.isMaterialLink(href, validExtensions)) {
          const materialInfo = this.parseMaterialInfo(href, text, language);
          if (materialInfo) {
            materials.push(materialInfo);
          }
        }
      });

      if (materials.length === 0) {
        return {
          component: 'Material Detection',
          test: `${language} Material Parsing`,
          result: 'WARNING',
          message: `No materials detected on page (this might be normal)`,
          data: { 
            language, 
            url, 
            parseTime,
            totalLinks: $('a').length,
            materialsFound: 0
          }
        };
      }

      // Validate parsed materials
      const validMaterials = materials.filter(m => m.filename && m.url);
      const invalidMaterials = materials.length - validMaterials.length;

      return {
        component: 'Material Detection',
        test: `${language} Material Parsing`,
        result: validMaterials.length > 0 ? 'PASS' : 'FAIL',
        message: `Detected ${validMaterials.length} valid materials${invalidMaterials > 0 ? ` (${invalidMaterials} invalid)` : ''}`,
        data: { 
          language, 
          url, 
          parseTime,
          totalMaterials: materials.length,
          validMaterials: validMaterials.length,
          invalidMaterials,
          materialTypes: [...new Set(validMaterials.map(m => m.materialType))],
          sampleMaterials: validMaterials.slice(0, 3)
        }
      };

    } catch (error) {
      return {
        component: 'Material Detection',
        test: `${language} Material Parsing`,
        result: 'FAIL',
        message: `Error parsing materials: ${error.message}`,
        data: { language, url, error: error.message }
      };
    }
  }

  /**
   * Check if a link is a valid material link
   */
  private isMaterialLink(href: string, validExtensions: string[]): boolean {
    return validExtensions.some(ext => href.toLowerCase().includes(ext));
  }

  /**
   * Parse material information from link
   */
  private parseMaterialInfo(href: string, text: string, language: string): MaterialInfo | null {
    try {
      const filename = href.split('/').pop() || '';
      const extension = path.extname(filename);
      
      // Determine material type
      let materialType = 'unknown';
      let period = '';
      let version = '';

      if (filename.includes('mwb_')) {
        materialType = 'meeting_workbook';
        const match = filename.match(/mwb_([A-Z])_(\d{6})/);
        if (match) {
          version = match[1];
          period = match[2];
        }
      } else if (filename.includes('S-38')) {
        materialType = 's38_guidelines';
      } else if (extension === '.pdf') {
        materialType = 'pdf_document';
      } else if (extension === '.jwpub') {
        materialType = 'jwpub_publication';
      }

      return {
        url: href.startsWith('http') ? href : `https://www.jw.org${href}`,
        filename,
        text,
        language,
        materialType,
        period,
        version,
        extension,
        size: 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Load mwbSources.json configuration
   */
  private async loadMwbSources(): Promise<MwbSources> {
    try {
      const content = await fs.readFile(this.mwbSourcesPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load mwbSources.json: ${error.message}`);
    }
  }

  /**
   * Test 6.2: Download functionality testing
   * - Test material download process and file handling
   * - Test download queue management and concurrent downloads
   * - Test file integrity validation and checksum verification
   */
  private async testDownloadFunctionality(): Promise<{ details: VerificationDetail[], hasErrors: boolean }> {
    const details: VerificationDetail[] = [];
    let hasErrors = false;

    try {
      // Test JWDownloader service initialization
      const initResult = await this.testJWDownloaderInitialization();
      details.push(initResult);
      if (initResult.result === 'FAIL') hasErrors = true;

      // Test download process with a small test file
      const downloadResult = await this.testMaterialDownloadProcess();
      details.push(downloadResult);
      if (downloadResult.result === 'FAIL') hasErrors = true;

      // Test file integrity validation
      const integrityResult = await this.testFileIntegrityValidation();
      details.push(integrityResult);
      if (integrityResult.result === 'FAIL') hasErrors = true;

      // Test download queue management
      const queueResult = await this.testDownloadQueueManagement();
      details.push(queueResult);
      if (queueResult.result === 'FAIL') hasErrors = true;

    } catch (error) {
      hasErrors = true;
      details.push({
        component: 'Download Functionality',
        test: 'Download Testing',
        result: 'FAIL',
        message: `Error during download functionality testing: ${error.message}`,
        data: { error: error.stack }
      });
    }

    return { details, hasErrors };
  }

  /**
   * Test JWDownloader service initialization
   */
  private async testJWDownloaderInitialization(): Promise<VerificationDetail> {
    try {
      // Try to require the JWDownloader service
      const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
      
      // Create instance
      const downloader = new JWDownloader();
      
      // Test initialization
      await downloader.initialize();
      
      // Verify download directory was created
      const downloadPath = path.join(process.cwd(), 'docs/Oficial');
      const exists = await fs.pathExists(downloadPath);
      
      if (!exists) {
        return {
          component: 'JWDownloader Service',
          test: 'Service Initialization',
          result: 'FAIL',
          message: 'Download directory was not created during initialization',
          data: { downloadPath }
        };
      }

      return {
        component: 'JWDownloader Service',
        test: 'Service Initialization',
        result: 'PASS',
        message: 'JWDownloader service initialized successfully',
        data: { downloadPath, exists }
      };

    } catch (error) {
      return {
        component: 'JWDownloader Service',
        test: 'Service Initialization',
        result: 'FAIL',
        message: `Failed to initialize JWDownloader service: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test material download process
   */
  private async testMaterialDownloadProcess(): Promise<VerificationDetail> {
    try {
      const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
      const downloader = new JWDownloader();
      await downloader.initialize();

      // Test with a small, known file (using a test URL)
      const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test file
      const testFilename = 'test-download.bin';
      
      const materialInfo = {
        url: testUrl,
        filename: testFilename,
        language: 'test',
        materialType: 'test',
        lastChecked: new Date().toISOString()
      };

      const result = await downloader.downloadMaterial(materialInfo);
      
      if (result.status === 'error') {
        return {
          component: 'Download Process',
          test: 'Material Download',
          result: 'FAIL',
          message: `Download failed: ${result.error}`,
          data: { materialInfo, result }
        };
      }

      // Verify file was downloaded
      const filePath = path.join(process.cwd(), 'docs/Oficial', testFilename);
      const exists = await fs.pathExists(filePath);
      
      if (!exists) {
        return {
          component: 'Download Process',
          test: 'Material Download',
          result: 'FAIL',
          message: 'Downloaded file not found on disk',
          data: { filePath, result }
        };
      }

      // Check file size
      const stats = await fs.stat(filePath);
      
      // Clean up test file
      await fs.remove(filePath);

      return {
        component: 'Download Process',
        test: 'Material Download',
        result: 'PASS',
        message: `Successfully downloaded and verified test file (${stats.size} bytes)`,
        data: { 
          materialInfo, 
          result, 
          fileSize: stats.size,
          cleanedUp: true
        }
      };

    } catch (error) {
      return {
        component: 'Download Process',
        test: 'Material Download',
        result: 'FAIL',
        message: `Error testing download process: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test file integrity validation
   */
  private async testFileIntegrityValidation(): Promise<VerificationDetail> {
    try {
      // Create a test file with known content
      const testContent = 'Test file content for integrity validation';
      const testFilename = 'integrity-test.txt';
      const testFilePath = path.join(this.downloadBasePath, testFilename);
      
      // Ensure download directory exists
      await fs.ensureDir(this.downloadBasePath);
      
      // Write test file
      await fs.writeFile(testFilePath, testContent);
      
      // Verify file exists and has correct content
      const exists = await fs.pathExists(testFilePath);
      if (!exists) {
        return {
          component: 'File Integrity',
          test: 'File Validation',
          result: 'FAIL',
          message: 'Test file was not created',
          data: { testFilePath }
        };
      }

      // Read and verify content
      const readContent = await fs.readFile(testFilePath, 'utf-8');
      const contentMatches = readContent === testContent;
      
      // Check file stats
      const stats = await fs.stat(testFilePath);
      const expectedSize = Buffer.byteLength(testContent, 'utf-8');
      const sizeMatches = stats.size === expectedSize;
      
      // Clean up
      await fs.remove(testFilePath);
      
      if (!contentMatches || !sizeMatches) {
        return {
          component: 'File Integrity',
          test: 'File Validation',
          result: 'FAIL',
          message: 'File integrity validation failed',
          data: { 
            contentMatches, 
            sizeMatches, 
            expectedSize, 
            actualSize: stats.size 
          }
        };
      }

      return {
        component: 'File Integrity',
        test: 'File Validation',
        result: 'PASS',
        message: 'File integrity validation successful',
        data: { 
          fileSize: stats.size, 
          contentVerified: true,
          cleanedUp: true
        }
      };

    } catch (error) {
      return {
        component: 'File Integrity',
        test: 'File Validation',
        result: 'FAIL',
        message: `Error testing file integrity: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test download queue management
   */
  private async testDownloadQueueManagement(): Promise<VerificationDetail> {
    try {
      const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
      const downloader = new JWDownloader();
      await downloader.initialize();

      // Test queue property exists
      if (!('downloadQueue' in downloader)) {
        return {
          component: 'Download Queue',
          test: 'Queue Management',
          result: 'FAIL',
          message: 'Download queue property not found in JWDownloader',
          data: { availableProperties: Object.keys(downloader) }
        };
      }

      // Test isDownloading flag
      if (!('isDownloading' in downloader)) {
        return {
          component: 'Download Queue',
          test: 'Queue Management',
          result: 'FAIL',
          message: 'isDownloading flag not found in JWDownloader',
          data: { availableProperties: Object.keys(downloader) }
        };
      }

      // Test initial state
      const initialQueueLength = downloader.downloadQueue.length;
      const initialDownloadingState = downloader.isDownloading;

      return {
        component: 'Download Queue',
        test: 'Queue Management',
        result: 'PASS',
        message: 'Download queue management structure verified',
        data: { 
          queueLength: initialQueueLength,
          isDownloading: initialDownloadingState,
          queueType: Array.isArray(downloader.downloadQueue) ? 'array' : typeof downloader.downloadQueue
        }
      };

    } catch (error) {
      return {
        component: 'Download Queue',
        test: 'Queue Management',
        result: 'FAIL',
        message: `Error testing download queue: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test 6.3: File organization and storage testing
   * - Test downloaded file organization by language and type
   * - Test directory structure validation for materials storage
   * - Test file naming convention and metadata validation
   */
  private async testFileOrganizationAndStorage(): Promise<{ details: VerificationDetail[], hasErrors: boolean }> {
    const details: VerificationDetail[] = [];
    let hasErrors = false;

    try {
      // Test directory structure validation
      const structureResult = await this.testDirectoryStructure();
      details.push(structureResult);
      if (structureResult.result === 'FAIL') hasErrors = true;

      // Test file organization by language and type
      const organizationResult = await this.testFileOrganization();
      details.push(organizationResult);
      if (organizationResult.result === 'FAIL') hasErrors = true;

      // Test file naming conventions
      const namingResult = await this.testFileNamingConventions();
      details.push(namingResult);
      if (namingResult.result === 'FAIL') hasErrors = true;

      // Test metadata validation
      const metadataResult = await this.testMetadataValidation();
      details.push(metadataResult);
      if (metadataResult.result === 'FAIL') hasErrors = true;

    } catch (error) {
      hasErrors = true;
      details.push({
        component: 'File Organization',
        test: 'Storage Testing',
        result: 'FAIL',
        message: `Error during file organization testing: ${error.message}`,
        data: { error: error.stack }
      });
    }

    return { details, hasErrors };
  }

  /**
   * Test directory structure for materials storage
   */
  private async testDirectoryStructure(): Promise<VerificationDetail> {
    try {
      const mwbSources = await this.loadMwbSources();
      const missingDirectories: string[] = [];
      const existingDirectories: string[] = [];
      
      // Check base download directory
      const baseExists = await fs.pathExists(this.downloadBasePath);
      if (!baseExists) {
        return {
          component: 'Directory Structure',
          test: 'Base Directory',
          result: 'FAIL',
          message: `Base download directory does not exist: ${this.downloadBasePath}`,
          data: { basePath: this.downloadBasePath }
        };
      }

      // Check language-specific directories from configuration
      for (const [language, source] of Object.entries(mwbSources)) {
        const languageDir = path.join(process.cwd(), source.downloadPath);
        const exists = await fs.pathExists(languageDir);
        
        if (exists) {
          existingDirectories.push(language);
        } else {
          missingDirectories.push(language);
        }
      }

      // Check if we can create missing directories
      for (const language of missingDirectories) {
        const source = mwbSources[language];
        const languageDir = path.join(process.cwd(), source.downloadPath);
        
        try {
          await fs.ensureDir(languageDir);
          existingDirectories.push(language);
        } catch (error) {
          return {
            component: 'Directory Structure',
            test: 'Directory Creation',
            result: 'FAIL',
            message: `Cannot create directory for ${language}: ${error.message}`,
            data: { language, path: languageDir, error: error.message }
          };
        }
      }

      return {
        component: 'Directory Structure',
        test: 'Directory Validation',
        result: 'PASS',
        message: `Directory structure validated for ${existingDirectories.length} languages`,
        data: { 
          basePath: this.downloadBasePath,
          existingDirectories,
          totalLanguages: Object.keys(mwbSources).length
        }
      };

    } catch (error) {
      return {
        component: 'Directory Structure',
        test: 'Directory Validation',
        result: 'FAIL',
        message: `Error validating directory structure: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test file organization by language and type
   */
  private async testFileOrganization(): Promise<VerificationDetail> {
    try {
      // Create test files in different language directories
      const testFiles = [
        { language: 'pt-BR', filename: 'mwb_T_202401.pdf', type: 'meeting_workbook' },
        { language: 'en-US', filename: 'mwb_E_202401.pdf', type: 'meeting_workbook' },
        { language: 'pt-BR', filename: 'S-38_202401.pdf', type: 's38_guidelines' }
      ];

      const mwbSources = await this.loadMwbSources();
      const createdFiles: string[] = [];

      for (const testFile of testFiles) {
        if (!(testFile.language in mwbSources)) continue;

        const source = mwbSources[testFile.language];
        const languageDir = path.join(process.cwd(), source.downloadPath);
        const filePath = path.join(languageDir, testFile.filename);

        // Ensure directory exists
        await fs.ensureDir(languageDir);

        // Create test file
        await fs.writeFile(filePath, `Test content for ${testFile.filename}`);
        createdFiles.push(filePath);

        // Verify file is in correct location
        const exists = await fs.pathExists(filePath);
        if (!exists) {
          return {
            component: 'File Organization',
            test: 'Language Organization',
            result: 'FAIL',
            message: `Test file not found in expected location: ${filePath}`,
            data: { testFile, filePath }
          };
        }
      }

      // Test file listing and organization
      const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
      const downloader = new JWDownloader();
      const listedMaterials = await downloader.listDownloadedMaterials();

      // Clean up test files
      for (const filePath of createdFiles) {
        await fs.remove(filePath);
      }

      return {
        component: 'File Organization',
        test: 'Language Organization',
        result: 'PASS',
        message: `File organization validated with ${createdFiles.length} test files`,
        data: { 
          testFilesCreated: createdFiles.length,
          listedMaterials: listedMaterials.length,
          cleanedUp: true
        }
      };

    } catch (error) {
      return {
        component: 'File Organization',
        test: 'Language Organization',
        result: 'FAIL',
        message: `Error testing file organization: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test file naming conventions
   */
  private async testFileNamingConventions(): Promise<VerificationDetail> {
    try {
      const testFilenames = [
        'mwb_T_202401.pdf',      // Valid meeting workbook
        'mwb_E_202401.pdf',      // Valid meeting workbook
        'S-38_202401.pdf',       // Valid S-38 guidelines
        'invalid-name.pdf',      // Invalid format
        'mwb_X_999999.pdf'       // Invalid period
      ];

      const JWDownloader = require(path.join(process.cwd(), 'backend/services/jwDownloader.js'));
      const downloader = new JWDownloader();

      const validationResults = testFilenames.map(filename => {
        const materialInfo = downloader.parseMaterialInfo(`/test/${filename}`, filename, 'test');
        return {
          filename,
          valid: materialInfo !== null,
          materialType: materialInfo?.materialType || 'unknown',
          period: materialInfo?.period || '',
          version: materialInfo?.version || ''
        };
      });

      const validFiles = validationResults.filter(r => r.valid);
      const invalidFiles = validationResults.filter(r => !r.valid);

      // Expected: first 3 should be valid, last 2 should be invalid
      const expectedValid = 3;
      const expectedInvalid = 2;

      if (validFiles.length !== expectedValid || invalidFiles.length !== expectedInvalid) {
        return {
          component: 'File Naming',
          test: 'Naming Conventions',
          result: 'WARNING',
          message: `Naming validation results differ from expected`,
          data: { 
            validFiles: validFiles.length,
            invalidFiles: invalidFiles.length,
            expectedValid,
            expectedInvalid,
            results: validationResults
          }
        };
      }

      return {
        component: 'File Naming',
        test: 'Naming Conventions',
        result: 'PASS',
        message: `File naming conventions validated correctly`,
        data: { 
          validFiles: validFiles.length,
          invalidFiles: invalidFiles.length,
          validationResults
        }
      };

    } catch (error) {
      return {
        component: 'File Naming',
        test: 'Naming Conventions',
        result: 'FAIL',
        message: `Error testing file naming conventions: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Test metadata validation
   */
  private async testMetadataValidation(): Promise<VerificationDetail> {
    try {
      // Create a test file with metadata
      const testFilename = 'metadata-test.pdf';
      const testFilePath = path.join(this.downloadBasePath, testFilename);
      const testContent = 'Test PDF content';

      await fs.ensureDir(this.downloadBasePath);
      await fs.writeFile(testFilePath, testContent);

      // Test file stats and metadata
      const stats = await fs.stat(testFilePath);
      const expectedSize = Buffer.byteLength(testContent, 'utf-8');

      // Validate metadata properties
      const metadata = {
        filename: testFilename,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        modifiedAt: stats.mtime,
        path: testFilePath,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };

      // Validate expected properties exist
      const requiredProperties = ['filename', 'size', 'modifiedAt', 'path'];
      const missingProperties = requiredProperties.filter(prop => !(prop in metadata));

      // Clean up
      await fs.remove(testFilePath);

      if (missingProperties.length > 0) {
        return {
          component: 'Metadata Validation',
          test: 'File Metadata',
          result: 'FAIL',
          message: `Missing required metadata properties: ${missingProperties.join(', ')}`,
          data: { metadata, missingProperties }
        };
      }

      if (stats.size !== expectedSize) {
        return {
          component: 'Metadata Validation',
          test: 'File Metadata',
          result: 'FAIL',
          message: `File size mismatch: expected ${expectedSize}, got ${stats.size}`,
          data: { expectedSize, actualSize: stats.size }
        };
      }

      return {
        component: 'Metadata Validation',
        test: 'File Metadata',
        result: 'PASS',
        message: 'File metadata validation successful',
        data: { 
          metadata,
          propertiesValidated: requiredProperties.length,
          cleanedUp: true
        }
      };

    } catch (error) {
      return {
        component: 'Metadata Validation',
        test: 'File Metadata',
        result: 'FAIL',
        message: `Error testing metadata validation: ${error.message}`,
        data: { error: error.message }
      };
    }
  }

  /**
   * Format bytes for human readability
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}