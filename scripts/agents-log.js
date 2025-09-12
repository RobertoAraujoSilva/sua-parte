#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.replace(/^--/, '').split('=');
      result[key] = rest.join('=');
    }
  }
  return result;
}

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return [];
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function updateAgentsMd(logEntries) {
  const agentsMdPath = path.resolve(process.cwd(), 'AGENTS.md');
  if (!fs.existsSync(agentsMdPath)) return;
  const md = fs.readFileSync(agentsMdPath, 'utf8');
  const start = '<!-- AGENTS_LOG_START -->';
  const end = '<!-- AGENTS_LOG_END -->';
  const startIdx = md.indexOf(start);
  const endIdx = md.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return;

  const sliceBefore = md.slice(0, startIdx + start.length);
  const sliceAfter = md.slice(endIdx);

  const lines = logEntries.slice(-50).map(e => {
    const ts = new Date(e.timestamp).toISOString();
    return `\n- [${ts}] **${e.agent}**: ${e.action} (${e.status})${e.details ? ` — ${e.details}` : ''}`;
  }).join('');

  const next = sliceBefore + '\n' + lines + '\n' + sliceAfter;
  fs.writeFileSync(agentsMdPath, next, 'utf8');
}

function main() {
  const args = parseArgs();
  const { agent = 'Orchestrator', action = 'unspecified', status = 'pending', details = '' } = args;

  const logPath = path.resolve(process.cwd(), 'agents.log.json');
  const entries = loadJSON(logPath);
  const entry = {
    timestamp: Date.now(),
    agent,
    action,
    status,
    details
  };
  entries.push(entry);
  saveJSON(logPath, entries);
  updateAgentsMd(entries);
  console.log('Logged:', entry);
}

main();




