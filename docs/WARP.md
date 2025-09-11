# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Starting the System
```bash
# Start both backend and frontend simultaneously (RECOMMENDED)
npm run dev:all

# Start components separately
npm run dev:backend-only    # Backend on port 3001
npm run dev:frontend-only   # Frontend on port 8080
```

### Testing
```bash
# Run all E2E tests
npm run cypress:run

# Run specific test suites
npm run test:admin          # Admin dashboard tests
npm run test:auth           # Authentication tests
npm run test:programs       # Programs functionality tests
npm run test:sistema-completo  # Complete system integration tests
```

### Build & Deploy
```bash
npm run build              # Production build
npm run build:dev          # Development build
npm run typecheck          # TypeScript type checking
npm run lint               # ESLint code linting
```

### Backend Specific
```bash
cd backend
npm run dev                # Start backend with nodemon
npm start                  # Production backend start
npm run backup             # Manual backup
npm run cleanup            # Clean old files
```

## System Architecture

### High-Level Structure

This is a **full-stack ministerial system** for managing JW.org materials and congregation programs, built with:

- **Frontend**: React + TypeScript + Vite (port 8080)
- **Backend**: Node.js + Express (port 3001) 
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with role-based access control
- **Testing**: Cypress E2E testing

### Core Service Architecture

The system follows a **service-oriented architecture** with distinct responsibilities:

```
Frontend (React) ←→ Backend (Node.js) ←→ Supabase DB
                            ↓
                    JW.org (Scraping/Downloads)
```

**Backend Services:**
- `JWDownloader`: Automated material download from JW.org
- `ProgramGenerator`: Weekly program generation from materials
- `MaterialManager`: File and metadata management
- `NotificationService`: System notifications

### Authentication & Authorization

**Role-based access control** with three main roles:
- **Admin**: Full system access, material management, global configuration
- **Instrutor**: Congregation management, student assignments, program creation
- **Estudante**: Read-only access to published materials

**Key Auth Components:**
- `AuthContext`: Global authentication state management
- `ProtectedRoute`: Route-level access control
- Supabase RLS (Row Level Security) for database security

### Data Flow Patterns

**Material Download Flow:**
1. Cron job (daily 3am) triggers automatic JW.org scraping
2. `JWDownloader` service checks for new materials
3. Downloads materials to `docs/Oficial/` directory
4. Updates database with material metadata
5. Notifies admins of new materials

**Program Generation Flow:**
1. Admin/Instrutor uploads or selects materials
2. `ProgramGenerator` parses PDF content
3. Extracts program structure and assignments
4. Generates structured program data
5. Publishes to congregation members

## Development Patterns

### Component Architecture

The frontend uses a **modular component architecture**:

```
src/
├── pages/           # Route-level components
├── components/      # Reusable UI components
├── contexts/        # React contexts for global state
├── integrations/    # External service integrations
└── utils/          # Helper functions and utilities
```

**Key Patterns:**
- React hooks for state management
- Context providers for global state (Auth, Tutorial, Language)
- Protected routes with role-based access
- Responsive design with TailwindCSS + Shadcn/ui

### Backend Patterns

The backend follows **service-oriented design**:

```
backend/
├── server.js        # Express app setup and middleware
├── services/        # Business logic services
├── routes/          # API endpoint handlers
├── config/          # Configuration files
└── docs/           # Downloaded materials storage
```

**Key Patterns:**
- RESTful API design
- Cron-based automation
- File system management for materials
- Middleware for authentication and CORS

### Database Schema Patterns

Using **Supabase** for:
- User profiles with role-based access
- Material metadata storage
- Program and assignment tracking
- Row Level Security (RLS) for data access control

### Testing Patterns

**E2E testing strategy** with Cypress:
- Authentication flow testing
- Admin dashboard functionality
- Material download and processing
- Program generation workflows
- Cross-browser compatibility testing

## Key Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DOCS_PATH=../docs/Oficial
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### Material Sources Configuration

The system downloads materials from JW.org using configured sources in `backend/config/mwbSources.json`:
- Multi-language support (PT-BR, EN-US, ES-ES, etc.)
- Configurable URLs for different language regions
- Active/inactive language toggle

### Development Server Configuration

- **Frontend**: Vite dev server on port 8080 with HMR
- **Backend**: Express server on port 3001 with CORS enabled
- **Concurrent mode**: Both servers run simultaneously via `concurrently`

## System Integration Points

### JW.org Integration
- Automated scraping using Cheerio for HTML parsing
- Support for multiple material formats (PDF, DAISY, JWPUB, RTF)
- Intelligent duplicate detection and file management

### Supabase Integration
- Real-time database updates
- Authentication and authorization
- File storage for user uploads
- Row Level Security for multi-tenant data access

### File System Management
- Organized material storage in `docs/Oficial/` by language
- Automatic backup system
- Disk space monitoring and cleanup

### Cron Automation
- Daily automatic material checks (3am local time)
- System health checks every 5 minutes
- Automated backup scheduling

## Common Development Tasks

### Adding New Material Sources
1. Update `backend/config/mwbSources.json`
2. Add URL parsing logic in `jwDownloader.js`
3. Test download functionality
4. Update admin dashboard to show new language

### Creating New User Roles
1. Update database enum type for user roles
2. Modify `AuthContext` role checking logic
3. Add role checks to protected routes
4. Update RLS policies in Supabase

### Adding New API Endpoints
1. Create route handler in appropriate `routes/` file
2. Add business logic to relevant service
3. Update authentication middleware if needed
4. Write integration tests

### Material Processing Pipeline
1. Materials are scraped from JW.org URLs
2. Downloaded to filesystem with organized structure
3. Metadata stored in database
4. PDF parsing extracts program structure
5. Programs generated and made available to congregations

## Admin Interface Access

The admin dashboard is accessed at `/admin` and provides:
- System status monitoring
- Material download management
- Program publication controls
- User and congregation management

**Admin Login**: amazonwebber007@gmail.com / admin123 (development)

## Development Notes

- The system uses **Portuguese (PT-BR) as primary language** with multi-language support
- **Debug information** is available in development mode via yellow debug panels
- **Concurrent development** allows frontend and backend development in parallel
- **TypeScript configuration** allows some flexibility for rapid development (noImplicitAny: false)
- **Cypress tests** provide comprehensive E2E coverage of critical user flows

## Performance Considerations

- Material downloads are queued to prevent overwhelming JW.org servers
- PDF parsing is optimized for typical meeting workbook structure
- Database queries use appropriate indexes for user roles and congregations
- Frontend uses code splitting for optimal bundle sizes
