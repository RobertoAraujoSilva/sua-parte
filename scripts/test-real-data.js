/**
 * Test Real Data from Supabase
 * This script tests the connection to Supabase and fetches real data
 */

const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealData() {
  try {
    console.log('🚀 Testing real data connection to Supabase...');
    console.log('📊 URL:', supabaseUrl);

    // Test 1: Check if tables exist
    console.log('\n📋 Testing table existence...');
    
    const tablesToTest = [
      'estudantes',
      'workbook_versions', 
      'global_programming',
      'congregacoes',
      'designacoes',
      'programas',
      'profiles'
    ];

    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName}: EXISTS`);
        }
      } catch (err) {
        console.log(`❌ Table ${tableName}: ${err.message}`);
      }
    }

    // Test 2: Get real counts
    console.log('\n📊 Getting real data counts...');
    
    const countPromises = tablesToTest.map(async (tableName) => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          return { table: tableName, count: 0, error: error.message };
        }
        return { table: tableName, count: count || 0, error: null };
      } catch (err) {
        return { table: tableName, count: 0, error: err.message };
      }
    });

    const counts = await Promise.all(countPromises);
    
    console.log('📈 Real data counts:');
    counts.forEach(({ table, count, error }) => {
      if (error) {
        console.log(`  ❌ ${table}: ${error}`);
      } else {
        console.log(`  ✅ ${table}: ${count} records`);
      }
    });

    // Test 3: Get sample data
    console.log('\n📝 Getting sample data...');
    
    // Sample students
    try {
      const { data: students, error: studentsError } = await supabase
        .from('estudantes')
        .select('id, nome, cargo, ativo')
        .limit(5);
      
      if (studentsError) {
        console.log(`❌ Error fetching students: ${studentsError.message}`);
      } else {
        console.log(`✅ Sample students (${students?.length || 0}):`);
        students?.forEach(student => {
          console.log(`  - ${student.nome} (${student.cargo}) - ${student.ativo ? 'Ativo' : 'Inativo'}`);
        });
      }
    } catch (err) {
      console.log(`❌ Exception fetching students: ${err.message}`);
    }

    // Sample workbooks
    try {
      const { data: workbooks, error: workbooksError } = await supabase
        .from('workbook_versions')
        .select('id, title, version_code, parsing_status')
        .limit(5);
      
      if (workbooksError) {
        console.log(`❌ Error fetching workbooks: ${workbooksError.message}`);
      } else {
        console.log(`✅ Sample workbooks (${workbooks?.length || 0}):`);
        workbooks?.forEach(workbook => {
          console.log(`  - ${workbook.title || workbook.version_code} (${workbook.parsing_status})`);
        });
      }
    } catch (err) {
      console.log(`❌ Exception fetching workbooks: ${err.message}`);
    }

    // Sample programming
    try {
      const { data: programming, error: programmingError } = await supabase
        .from('global_programming')
        .select('id, part_title, meeting_type, status')
        .limit(5);
      
      if (programmingError) {
        console.log(`❌ Error fetching programming: ${programmingError.message}`);
      } else {
        console.log(`✅ Sample programming (${programming?.length || 0}):`);
        programming?.forEach(prog => {
          console.log(`  - ${prog.part_title} (${prog.meeting_type}) - ${prog.status}`);
        });
      }
    } catch (err) {
      console.log(`❌ Exception fetching programming: ${err.message}`);
    }

    // Sample congregations
    try {
      const { data: congregations, error: congregationsError } = await supabase
        .from('congregacoes')
        .select('id, nome, cidade, ativa')
        .limit(5);
      
      if (congregationsError) {
        console.log(`❌ Error fetching congregations: ${congregationsError.message}`);
      } else {
        console.log(`✅ Sample congregations (${congregations?.length || 0}):`);
        congregations?.forEach(cong => {
          console.log(`  - ${cong.nome} (${cong.cidade}) - ${cong.ativa ? 'Ativa' : 'Inativa'}`);
        });
      }
    } catch (err) {
      console.log(`❌ Exception fetching congregations: ${err.message}`);
    }

    // Test 4: Test dashboard stats calculation
    console.log('\n📊 Testing dashboard stats calculation...');
    
    try {
      const [studentsCount, workbooksCount, programmingCount, congregationsCount] = await Promise.all([
        supabase.from('estudantes').select('*', { count: 'exact', head: true }),
        supabase.from('workbook_versions').select('*', { count: 'exact', head: true }),
        supabase.from('global_programming').select('*', { count: 'exact', head: true }),
        supabase.from('congregacoes').select('*', { count: 'exact', head: true })
      ]);

      const dashboardStats = {
        totalStudents: studentsCount.count || 0,
        totalWorkbooks: workbooksCount.count || 0,
        totalProgramming: programmingCount.count || 0,
        totalCongregations: congregationsCount.count || 0
      };

      console.log('✅ Dashboard stats calculated:');
      console.log(`  - Students: ${dashboardStats.totalStudents}`);
      console.log(`  - Workbooks: ${dashboardStats.totalWorkbooks}`);
      console.log(`  - Programming: ${dashboardStats.totalProgramming}`);
      console.log(`  - Congregations: ${dashboardStats.totalCongregations}`);

    } catch (err) {
      console.log(`❌ Error calculating dashboard stats: ${err.message}`);
    }

    console.log('\n🎉 Real data test completed!');
    console.log('📝 Summary:');
    console.log('  - Tables checked:', tablesToTest.length);
    console.log('  - Sample data retrieved for key tables');
    console.log('  - Dashboard stats calculated');
    console.log('\n💡 Next steps:');
    console.log('  - Use this data in your dashboards');
    console.log('  - Replace mock data with real data');
    console.log('  - Test the real data fetcher utility');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRealData()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
