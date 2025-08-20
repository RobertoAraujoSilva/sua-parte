import XLSX from 'xlsx';
import Database from 'better-sqlite3';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class SeedDatabaseCreator {
    constructor() {
        this.excelPath = path.join(__dirname, '../docs/Oficial/estudantes_ficticios.xlsx');
        this.outputPath = path.join(__dirname, '../resources/seed/ministerial-seed.db');
        this.congregacaoId = 'congregacao-exemplar-001';
    }
    async createSeedDatabase() {
        try {
            console.log('🚀 Starting seed database creation...');
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(this.outputPath));
            // Remove existing seed database if it exists
            if (await fs.pathExists(this.outputPath)) {
                await fs.remove(this.outputPath);
                console.log('🗑️ Removed existing seed database');
            }
            // Create new database
            const db = new Database(this.outputPath);
            // Create schema
            await this.createSchema(db);
            console.log('✅ Database schema created');
            // Load and convert Excel data
            const students = await this.loadStudentsFromExcel();
            console.log(`📊 Loaded ${students.length} students from Excel`);
            // Insert seed data
            await this.insertProfiles(db);
            await this.insertStudents(db, students);
            await this.insertSamplePrograms(db);
            await this.insertSampleAssignments(db, students);
            await this.insertSampleMeetings(db);
            db.close();
            const stats = await fs.stat(this.outputPath);
            console.log(`✅ Seed database created successfully!`);
            console.log(`📍 Location: ${this.outputPath}`);
            console.log(`📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
        }
        catch (error) {
            console.error('❌ Failed to create seed database:', error);
            throw error;
        }
    }
    async createSchema(db) {
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        // Create all tables with proper schema
        db.exec(`
      -- Profiles table
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'estudante')),
        nome TEXT,
        congregacao_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Students table
      CREATE TABLE estudantes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        sobrenome TEXT,
        data_nascimento TEXT,
        telefone TEXT,
        email TEXT,
        cargo TEXT NOT NULL CHECK (cargo IN ('anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo')),
        genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
        privilegios TEXT,
        congregacao_id TEXT NOT NULL,
        id_pai_mae TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (id_pai_mae) REFERENCES estudantes(id)
      );

      -- Programs table
      CREATE TABLE programas (
        id TEXT PRIMARY KEY,
        semana_inicio TEXT NOT NULL,
        semana_fim TEXT NOT NULL,
        material_estudo TEXT,
        congregacao_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'arquivado')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Assignments table
      CREATE TABLE designacoes (
        id TEXT PRIMARY KEY,
        programa_id TEXT NOT NULL,
        estudante_id TEXT NOT NULL,
        ajudante_id TEXT,
        parte TEXT NOT NULL,
        tema TEXT,
        tempo_minutos INTEGER,
        observacoes TEXT,
        status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'cancelada')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
        FOREIGN KEY (estudante_id) REFERENCES estudantes(id),
        FOREIGN KEY (ajudante_id) REFERENCES estudantes(id)
      );

      -- Meetings table
      CREATE TABLE meetings (
        id TEXT PRIMARY KEY,
        meeting_date TEXT NOT NULL,
        meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular_midweek', 'regular_weekend', 'circuit_overseer_visit', 'assembly_week', 'convention_week', 'memorial', 'special_event', 'cancelled')),
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT,
        end_time TEXT,
        circuit_overseer_name TEXT,
        service_talk_title TEXT,
        closing_song_number INTEGER,
        congregacao_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Administrative assignments table
      CREATE TABLE administrative_assignments (
        id TEXT PRIMARY KEY,
        id_estudante TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('meeting_overseer', 'meeting_chairman', 'assistant_counselor', 'room_overseer', 'circuit_overseer')),
        assignment_date TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_recurring INTEGER NOT NULL DEFAULT 0,
        assigned_room TEXT CHECK (assigned_room IN ('main_hall', 'auxiliary_room_1', 'auxiliary_room_2', 'auxiliary_room_3')),
        notes TEXT,
        congregacao_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (id_estudante) REFERENCES estudantes(id)
      );

      -- Migrations table
      CREATE TABLE migrations (
        version TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);
        // Create indexes
        db.exec(`
      CREATE INDEX idx_estudantes_congregacao ON estudantes(congregacao_id);
      CREATE INDEX idx_estudantes_cargo ON estudantes(cargo);
      CREATE INDEX idx_estudantes_ativo ON estudantes(ativo);
      CREATE INDEX idx_programas_congregacao ON programas(congregacao_id);
      CREATE INDEX idx_programas_semana ON programas(semana_inicio);
      CREATE INDEX idx_designacoes_programa ON designacoes(programa_id);
      CREATE INDEX idx_designacoes_estudante ON designacoes(estudante_id);
      CREATE INDEX idx_meetings_congregacao ON meetings(congregacao_id);
      CREATE INDEX idx_meetings_date ON meetings(meeting_date);
      CREATE INDEX idx_admin_assignments_estudante ON administrative_assignments(id_estudante);
      CREATE INDEX idx_admin_assignments_congregacao ON administrative_assignments(congregacao_id);
    `);
        // Insert migration records
        const now = new Date().toISOString();
        db.prepare('INSERT INTO migrations (version, description, applied_at) VALUES (?, ?, ?)').run('001', 'Create basic schema', now);
        db.prepare('INSERT INTO migrations (version, description, applied_at) VALUES (?, ?, ?)').run('002', 'Create indexes for performance', now);
    }
    async loadStudentsFromExcel() {
        if (!await fs.pathExists(this.excelPath)) {
            console.log('⚠️ Excel file not found, creating sample students...');
            return this.createSampleStudents();
        }
        try {
            const workbook = XLSX.readFile(this.excelPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const excelData = XLSX.utils.sheet_to_json(worksheet);
            // Debug: Show first row and column names
            if (excelData.length > 0) {
                console.log('📋 Excel columns found:', Object.keys(excelData[0]));
                console.log('📋 First row sample:', excelData[0]);
            }
            const now = new Date().toISOString();
            return excelData.map((row) => ({
                id: uuidv4(),
                nome: row.nome || '',
                sobrenome: row.familia || '',
                data_nascimento: this.formatDate(row.data_nascimento),
                telefone: row.telefone || '',
                email: row.email || '',
                cargo: this.mapCargo(row.cargo),
                genero: this.mapGenero(row.genero),
                privilegios: null, // No privilegios column in Excel
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: row.ativo === 'true' ? 1 : 0,
                created_at: now,
                updated_at: now
            }));
        }
        catch (error) {
            console.log('⚠️ Failed to read Excel file, creating sample students...', error);
            return this.createSampleStudents();
        }
    }
    createSampleStudents() {
        const now = new Date().toISOString();
        return [
            {
                id: uuidv4(),
                nome: 'João',
                sobrenome: 'Silva',
                data_nascimento: '1980-05-15',
                telefone: '(11) 99999-0001',
                email: 'joao.silva@exemplo.com',
                cargo: 'anciao',
                genero: 'masculino',
                privilegios: 'Coordenador do Corpo de Anciãos',
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nome: 'Maria',
                sobrenome: 'Santos',
                data_nascimento: '1985-08-22',
                telefone: '(11) 99999-0002',
                email: 'maria.santos@exemplo.com',
                cargo: 'pioneiro_regular',
                genero: 'feminino',
                privilegios: null,
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nome: 'Pedro',
                sobrenome: 'Oliveira',
                data_nascimento: '1975-12-03',
                telefone: '(11) 99999-0003',
                email: 'pedro.oliveira@exemplo.com',
                cargo: 'servo_ministerial',
                genero: 'masculino',
                privilegios: 'Superintendente da Escola do Ministério Teocrático',
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nome: 'Ana',
                sobrenome: 'Costa',
                data_nascimento: '1990-03-18',
                telefone: '(11) 99999-0004',
                email: 'ana.costa@exemplo.com',
                cargo: 'publicador_batizado',
                genero: 'feminino',
                privilegios: null,
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nome: 'Carlos',
                sobrenome: 'Ferreira',
                data_nascimento: '1995-07-10',
                telefone: '(11) 99999-0005',
                email: 'carlos.ferreira@exemplo.com',
                cargo: 'publicador_nao_batizado',
                genero: 'masculino',
                privilegios: null,
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nome: 'Lucia',
                sobrenome: 'Rodrigues',
                data_nascimento: '2005-11-25',
                telefone: '(11) 99999-0006',
                email: 'lucia.rodrigues@exemplo.com',
                cargo: 'estudante_novo',
                genero: 'feminino',
                privilegios: null,
                congregacao_id: this.congregacaoId,
                id_pai_mae: null,
                ativo: 1,
                created_at: now,
                updated_at: now
            }
        ];
    }
    async insertProfiles(db) {
        const now = new Date().toISOString();
        const profiles = [
            {
                id: 'admin-exemplar-001',
                email: 'admin@congregacao-exemplar.org',
                role: 'admin',
                nome: 'Administrador Exemplar',
                congregacao_id: this.congregacaoId,
                created_at: now,
                updated_at: now
            },
            {
                id: 'instrutor-exemplar-001',
                email: 'instrutor@congregacao-exemplar.org',
                role: 'instrutor',
                nome: 'Instrutor Exemplar',
                congregacao_id: this.congregacaoId,
                created_at: now,
                updated_at: now
            }
        ];
        const stmt = db.prepare(`
      INSERT INTO profiles (id, email, role, nome, congregacao_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        for (const profile of profiles) {
            stmt.run(profile.id, profile.email, profile.role, profile.nome, profile.congregacao_id, profile.created_at, profile.updated_at);
        }
        console.log(`✅ Inserted ${profiles.length} profiles`);
    }
    async insertStudents(db, students) {
        const stmt = db.prepare(`
      INSERT INTO estudantes (
        id, nome, sobrenome, data_nascimento, telefone, email, cargo, genero,
        privilegios, congregacao_id, id_pai_mae, ativo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const student of students) {
            stmt.run(student.id, student.nome, student.sobrenome, student.data_nascimento, student.telefone, student.email, student.cargo, student.genero, student.privilegios, student.congregacao_id, student.id_pai_mae, student.ativo, student.created_at, student.updated_at);
        }
        console.log(`✅ Inserted ${students.length} students`);
    }
    async insertSamplePrograms(db) {
        const now = new Date().toISOString();
        const currentDate = new Date();
        const programs = [];
        // Create 4 weeks of sample programs
        for (let i = 0; i < 4; i++) {
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() + (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            programs.push({
                id: uuidv4(),
                semana_inicio: weekStart.toISOString().split('T')[0],
                semana_fim: weekEnd.toISOString().split('T')[0],
                material_estudo: `Material de Estudo - Semana ${i + 1}`,
                congregacao_id: this.congregacaoId,
                status: i === 0 ? 'ativo' : 'rascunho',
                created_at: now,
                updated_at: now
            });
        }
        const stmt = db.prepare(`
      INSERT INTO programas (id, semana_inicio, semana_fim, material_estudo, congregacao_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const program of programs) {
            stmt.run(program.id, program.semana_inicio, program.semana_fim, program.material_estudo, program.congregacao_id, program.status, program.created_at, program.updated_at);
        }
        console.log(`✅ Inserted ${programs.length} sample programs`);
    }
    async insertSampleAssignments(db, students) {
        const programs = db.prepare('SELECT id FROM programas ORDER BY semana_inicio').all();
        const now = new Date().toISOString();
        const assignments = [];
        const parts = [
            'Tesouros da Palavra de Deus',
            'Faça Seu Melhor no Ministério - Demonstração',
            'Faça Seu Melhor no Ministério - Discurso',
            'Nossa Vida Cristã - Parte 1',
            'Nossa Vida Cristã - Parte 2'
        ];
        for (const program of programs) {
            // Create 3-5 assignments per program
            const numAssignments = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numAssignments; i++) {
                const student = students[Math.floor(Math.random() * students.length)];
                const part = parts[i % parts.length];
                assignments.push({
                    id: uuidv4(),
                    programa_id: program.id,
                    estudante_id: student.id,
                    ajudante_id: Math.random() > 0.7 ? students[Math.floor(Math.random() * students.length)].id : null,
                    parte: part,
                    tema: `Tema da ${part}`,
                    tempo_minutos: 5 + Math.floor(Math.random() * 10),
                    observacoes: Math.random() > 0.8 ? 'Observações especiais' : null,
                    status: 'agendada',
                    created_at: now
                });
            }
        }
        const stmt = db.prepare(`
      INSERT INTO designacoes (id, programa_id, estudante_id, ajudante_id, parte, tema, tempo_minutos, observacoes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const assignment of assignments) {
            stmt.run(assignment.id, assignment.programa_id, assignment.estudante_id, assignment.ajudante_id, assignment.parte, assignment.tema, assignment.tempo_minutos, assignment.observacoes, assignment.status, assignment.created_at);
        }
        console.log(`✅ Inserted ${assignments.length} sample assignments`);
    }
    async insertSampleMeetings(db) {
        const now = new Date().toISOString();
        const currentDate = new Date();
        const meetings = [];
        // Create sample meetings for the next 4 weeks
        for (let i = 0; i < 4; i++) {
            const meetingDate = new Date(currentDate);
            meetingDate.setDate(currentDate.getDate() + (i * 7));
            meetings.push({
                id: uuidv4(),
                meeting_date: meetingDate.toISOString().split('T')[0],
                meeting_type: 'regular_midweek',
                title: `Reunião do Meio da Semana - ${meetingDate.toLocaleDateString('pt-BR')}`,
                description: 'Reunião regular do meio da semana',
                start_time: '19:30',
                end_time: '21:00',
                circuit_overseer_name: null,
                service_talk_title: null,
                closing_song_number: 150 + i,
                congregacao_id: this.congregacaoId,
                status: 'scheduled',
                created_at: now,
                updated_at: now
            });
        }
        const stmt = db.prepare(`
      INSERT INTO meetings (
        id, meeting_date, meeting_type, title, description, start_time, end_time,
        circuit_overseer_name, service_talk_title, closing_song_number,
        congregacao_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        for (const meeting of meetings) {
            stmt.run(meeting.id, meeting.meeting_date, meeting.meeting_type, meeting.title, meeting.description, meeting.start_time, meeting.end_time, meeting.circuit_overseer_name, meeting.service_talk_title, meeting.closing_song_number, meeting.congregacao_id, meeting.status, meeting.created_at, meeting.updated_at);
        }
        console.log(`✅ Inserted ${meetings.length} sample meetings`);
    }
    formatDate(dateValue) {
        if (!dateValue)
            return '';
        // Handle Excel date serial numbers
        if (typeof dateValue === 'number') {
            const date = new Date((dateValue - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }
        // Handle string dates
        if (typeof dateValue === 'string') {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
        return '';
    }
    mapCargo(cargo) {
        if (!cargo)
            return 'publicador_batizado';
        const cargoLower = cargo.toLowerCase();
        if (cargoLower.includes('ancião') || cargoLower.includes('anciao'))
            return 'anciao';
        if (cargoLower.includes('servo ministerial'))
            return 'servo_ministerial';
        if (cargoLower.includes('pioneiro'))
            return 'pioneiro_regular';
        if (cargoLower.includes('não batizado') || cargoLower.includes('nao batizado'))
            return 'publicador_nao_batizado';
        if (cargoLower.includes('estudante'))
            return 'estudante_novo';
        return 'publicador_batizado';
    }
    mapGenero(genero) {
        if (!genero)
            return 'masculino';
        const generoLower = genero.toLowerCase();
        if (generoLower.includes('f') || generoLower.includes('mulher') || generoLower.includes('feminino')) {
            return 'feminino';
        }
        return 'masculino';
    }
}
// Run the script
const creator = new SeedDatabaseCreator();
creator.createSeedDatabase()
    .then(() => {
    console.log('🎉 Seed database creation completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Seed database creation failed:', error);
    process.exit(1);
});
export { SeedDatabaseCreator };
