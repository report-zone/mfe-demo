#!/usr/bin/env node

/**
 * Script to run production builds locally
 * 
 * This script:
 * 1. Builds all applications (if not already built)
 * 2. Starts all preview servers (Vite preview mode)
 * 
 * Usage:
 *   yarn prod:local
 *   OR
 *   yarn prod:local --skip-build  (to skip rebuilding)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const skipBuild = process.argv.includes('--skip-build');

console.log('🚀 Running Production Locally\n');

function checkDistExists() {
  const apps = ['container', 'home', 'preferences', 'account', 'admin'];
  const missingDist = [];
  
  for (const app of apps) {
    const distPath = path.join(__dirname, '..', 'apps', app, 'dist');
    if (!fs.existsSync(distPath)) {
      missingDist.push(app);
    }
  }
  
  return missingDist;
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  try {
    // Check if builds exist
    const missingDist = checkDistExists();

    if (!skipBuild || missingDist.length > 0) {
      if (missingDist.length > 0) {
        console.log(`⚠️  Missing dist folders for: ${missingDist.join(', ')}`);
      }
      console.log('📦 Building all applications...\n');
      await runCommand('yarn', ['build']);
      console.log('\n✅ Build complete!\n');
    } else {
      console.log('⏭️  Skipping build (using existing dist folders)\n');
    }

    // Start all preview servers using concurrently
    console.log('🌐 Starting all preview servers...\n');
    console.log('📍 Access points:');
    console.log('   Container:   http://localhost:4000');
    console.log('   Home MFE:    http://localhost:3001');
    console.log('   Preferences: http://localhost:3002');
    console.log('   Account:     http://localhost:3003');
    console.log('   Admin:       http://localhost:3004');
    console.log('\n👉 Open http://localhost:4000 to view the application\n');
    console.log('Press Ctrl+C to stop all servers\n');

    // Run preview servers
    await runCommand('yarn', ['preview']);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
