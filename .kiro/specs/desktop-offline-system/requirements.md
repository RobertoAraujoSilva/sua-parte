# Requirements Document

## Introduction

This document outlines the requirements for implementing a desktop offline system for the Ministerial System. The current system operates as a web application using Supabase for data storage, but needs to be transformed into a desktop application that works completely offline using SQLite for local data storage. This is critical for ensuring complete privacy and functionality without internet connectivity.

## Requirements

### Requirement 1

**User Story:** As a congregation member, I want to install a desktop application that works completely offline, so that I can manage ministerial assignments without any data leaving my local machine.

#### Acceptance Criteria

1. WHEN the user downloads and installs the desktop application THEN the system SHALL create a local SQLite database automatically
2. WHEN the application starts for the first time THEN the system SHALL copy the "Exemplar" seed database to the user's local data directory
3. WHEN the application is running THEN the system SHALL function completely offline without requiring internet connectivity
4. WHEN the user performs any data operations THEN the system SHALL store all data locally in SQLite without sending anything to external servers

### Requirement 2

**User Story:** As a system administrator, I want the application to use Electron for desktop distribution, so that it can be installed on Windows, macOS, and Linux systems.

#### Acceptance Criteria

1. WHEN building the application THEN the system SHALL generate installers for Windows (.exe), macOS (.dmg), and Linux (.AppImage/.deb)
2. WHEN the Electron main process starts THEN the system SHALL initialize the Express backend server on a local port
3. WHEN the backend is ready THEN the system SHALL load the React frontend in the Electron window
4. WHEN the application window is closed THEN the system SHALL properly shut down the backend server

### Requirement 3

**User Story:** As a developer, I want a unified data access layer, so that the system can work with both SQLite (offline) and Supabase (web) without changing business logic.

#### Acceptance Criteria

1. WHEN implementing data operations THEN the system SHALL use a common interface (IDataStore) for all database interactions
2. WHEN running in desktop mode THEN the system SHALL use SQLiteStore implementation
3. WHEN running in web mode THEN the system SHALL use SupabaseStore implementation
4. WHEN switching between implementations THEN the system SHALL maintain the same API contract for all data operations

### Requirement 4

**User Story:** As a congregation instructor, I want the same dashboard functionality in the desktop app, so that I can manage students and generate programs exactly as I do in the web version.

#### Acceptance Criteria

1. WHEN accessing the instructor dashboard THEN the system SHALL provide identical functionality to the web version
2. WHEN generating weekly programs THEN the system SHALL apply S-38 rules and fair rotation logic using local data
3. WHEN managing students THEN the system SHALL store all student information in the local SQLite database
4. WHEN viewing assignment history THEN the system SHALL retrieve data from the local database

### Requirement 5

**User Story:** As a congregation administrator, I want to optionally download materials from JW.org, so that I can keep the local system updated with current publications.

#### Acceptance Criteria

1. WHEN the admin chooses to download materials THEN the system SHALL connect to JW.org only when explicitly requested
2. WHEN materials are downloaded THEN the system SHALL store them in the local docs/Oficial directory
3. WHEN operating offline THEN the system SHALL work with previously downloaded materials without requiring new downloads
4. WHEN no internet is available THEN the system SHALL continue to function with existing local materials

### Requirement 6

**User Story:** As a user concerned about privacy, I want all data to remain on my local machine, so that no personal or congregation information is transmitted externally.

#### Acceptance Criteria

1. WHEN the application is running in offline mode THEN the system SHALL NOT send any data to external servers
2. WHEN storing congregation data THEN the system SHALL keep all information in the local SQLite database
3. WHEN generating logs THEN the system SHALL NOT include any personally identifiable information
4. WHEN the user exports data THEN the system SHALL create local .zip packages without uploading anywhere

### Requirement 7

**User Story:** As a congregation member, I want to import and export data packages, so that I can backup my data or transfer it to another installation.

#### Acceptance Criteria

1. WHEN exporting data THEN the system SHALL create a .zip package containing the SQLite database and materials
2. WHEN importing a data package THEN the system SHALL extract and update the local database and materials
3. WHEN validating imports THEN the system SHALL verify data integrity before applying changes
4. WHEN handling corrupted packages THEN the system SHALL display appropriate error messages and maintain data safety

### Requirement 8

**User Story:** As a new user, I want the application to come with example data, so that I can immediately understand how the system works and see sample programs.

#### Acceptance Criteria

1. WHEN installing the application THEN the system SHALL include a pre-configured "Exemplar" seed database
2. WHEN the seed database is created THEN the system SHALL contain fictional students and sample programs
3. WHEN viewing the sample data THEN the system SHALL demonstrate all key features and workflows
4. WHEN the user is ready THEN the system SHALL allow easy replacement of sample data with real congregation information