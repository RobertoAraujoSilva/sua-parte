import Database from 'better-sqlite3';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class SeedDatabaseDebugger {
    constructor() {
        this.seedPath = path.join(__dirname, '../resources/seed/ministerial-seed.db');
    }
    async debugSeedDatabase() {
        try {
            console.log('🔍 Debugging seed database...');
            if (!await fs.pathExists(this.seedPath)) {
                throw new Error(`Seed database not found at: ${this.seedPath}`);
            }
            const db = new Database(this.seedPath, { readonly: true });
            // Check first 5 students
            console.log('\n👥 First 5 students:');
            const students = db.prepare('SELECT id, nome, sobrenome, cargo, genero FROM estudantes LIMIT 5').all();
            console.table(students);
            // Check profiles
            console.log('\n👤 Profiles:');
            const profiles = db.prepare('SELECT * FROM profiles').all();
            console.table(profiles);
            // Check programs
            console.log('\n📅 Programs:');
            const programs = db.prepare('SELECT * FROM programas').all();
            console.table(programs);
            // Check assignments
            console.log('\n📋 First 5 assignments:');
            const assignments = db.prepare('SELECT * FROM designacoes LIMIT 5').all();
            console.table(assignments);
            db.close();
        }
        catch (error) {
            console.error('❌ Debug failed:', error);
            throw error;
        }
    }
}
// Run the debug
const debug = new SeedDatabaseDebugger();
debug.debugSeedDatabase()
    .then(() => {
    console.log('🎉 Debug completed!');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
});
export { SeedDatabaseDebugger };
