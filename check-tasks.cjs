#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Task Status Verification Script
 * Reads EXECUTION_TASKS_TRACKER.md and provides a comprehensive status report
 */

const TASK_FILE = 'docs/EXECUTION_TASKS_TRACKER.md';

function parseTaskFile() {
  if (!fs.existsSync(TASK_FILE)) {
    console.error(`❌ Task file not found: ${TASK_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(TASK_FILE, 'utf8');
  const lines = content.split('\n');
  
  const tasks = {
    completed: [],
    inProgress: [],
    pending: []
  };

  let currentSection = '';
  
  for (const line of lines) {
    // Track current section
    if (line.startsWith('## MCP-') || line.startsWith('## Operacional')) {
      currentSection = line.replace('## ', '').trim();
      continue;
    }

    // Parse task lines
    const taskMatch = line.match(/^- \[([ x~])\] (\d+\.\d+) (.+)$/);
    if (taskMatch) {
      const [, status, taskId, description] = taskMatch;
      const task = {
        section: currentSection,
        id: taskId,
        description: description.trim(),
        status: status
      };

      switch (status) {
        case 'x':
          tasks.completed.push(task);
          break;
        case '~':
          tasks.inProgress.push(task);
          break;
        case ' ':
          tasks.pending.push(task);
          break;
      }
    }
  }

  return tasks;
}

function generateReport(tasks) {
  const total = tasks.completed.length + tasks.inProgress.length + tasks.pending.length;
  const completedPercent = Math.round((tasks.completed.length / total) * 100);
  
  console.log('🎯 SISTEMA MINISTERIAL - TASK STATUS REPORT');
  console.log('=' .repeat(50));
  console.log(`📊 Progress: ${tasks.completed.length}/${total} tasks completed (${completedPercent}%)`);
  console.log('');

  // Summary by status
  console.log('📈 SUMMARY BY STATUS:');
  console.log(`✅ Completed: ${tasks.completed.length}`);
  console.log(`🔄 In Progress: ${tasks.inProgress.length}`);
  console.log(`⏳ Pending: ${tasks.pending.length}`);
  console.log('');

  // Group by section
  const sections = {};
  [...tasks.completed, ...tasks.inProgress, ...tasks.pending].forEach(task => {
    if (!sections[task.section]) {
      sections[task.section] = { completed: 0, inProgress: 0, pending: 0 };
    }
    
    if (task.status === 'x') sections[task.section].completed++;
    else if (task.status === '~') sections[task.section].inProgress++;
    else sections[task.section].pending++;
  });

  console.log('📋 PROGRESS BY SECTION:');
  Object.entries(sections).forEach(([section, counts]) => {
    const sectionTotal = counts.completed + counts.inProgress + counts.pending;
    const sectionPercent = Math.round((counts.completed / sectionTotal) * 100);
    console.log(`  ${section}: ${counts.completed}/${sectionTotal} (${sectionPercent}%) - ✅${counts.completed} 🔄${counts.inProgress} ⏳${counts.pending}`);
  });
  console.log('');

  // High priority pending tasks
  if (tasks.pending.length > 0) {
    console.log('🚨 HIGH PRIORITY PENDING TASKS:');
    const highPriorityTasks = tasks.pending.filter(task => 
      task.section.includes('MCP-01') || task.section.includes('MCP-02')
    );
    
    if (highPriorityTasks.length > 0) {
      highPriorityTasks.forEach(task => {
        console.log(`  ⚠️  ${task.section} ${task.id}: ${task.description}`);
      });
    } else {
      console.log('  ✅ No high priority tasks pending');
    }
    console.log('');
  }

  // In progress tasks
  if (tasks.inProgress.length > 0) {
    console.log('🔄 TASKS IN PROGRESS:');
    tasks.inProgress.forEach(task => {
      console.log(`  🔧 ${task.section} ${task.id}: ${task.description}`);
    });
    console.log('');
  }

  // Next recommended actions
  console.log('🎯 RECOMMENDED NEXT ACTIONS:');
  if (tasks.inProgress.length > 0) {
    console.log('  1. Complete in-progress tasks first');
  }
  
  const pendingHighPriority = tasks.pending.filter(task => 
    task.section.includes('MCP-01') || task.section.includes('MCP-02')
  );
  
  if (pendingHighPriority.length > 0) {
    console.log('  2. Focus on high-priority MCP-01 (PDFs) and MCP-02 (Offline) tasks');
  }
  
  const pendingMediumPriority = tasks.pending.filter(task => 
    task.section.includes('MCP-03') || task.section.includes('MCP-05')
  );
  
  if (pendingMediumPriority.length > 0) {
    console.log('  3. Then proceed with MCP-03 (Sync) and MCP-05 (RLS) tasks');
  }
  
  console.log('');
  
  // Readiness assessment
  const criticalTasksComplete = tasks.completed.filter(task => 
    task.section.includes('MCP-01') || task.section.includes('MCP-02')
  ).length;
  
  const totalCriticalTasks = [...tasks.completed, ...tasks.inProgress, ...tasks.pending]
    .filter(task => task.section.includes('MCP-01') || task.section.includes('MCP-02')).length;
  
  console.log('🚀 COMMIT READINESS:');
  if (tasks.pending.length === 0 && tasks.inProgress.length === 0) {
    console.log('  ✅ READY FOR COMMIT - All tasks completed!');
  } else if (criticalTasksComplete === totalCriticalTasks) {
    console.log('  ⚠️  PARTIAL READINESS - Critical features complete, but some tasks remain');
  } else {
    console.log('  ❌ NOT READY - Critical tasks still pending');
  }
}

// Main execution
try {
  const tasks = parseTaskFile();
  generateReport(tasks);
} catch (error) {
  console.error('❌ Error processing task file:', error.message);
  process.exit(1);
}
