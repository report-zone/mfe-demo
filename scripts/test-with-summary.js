#!/usr/bin/env node
const { execSync } = require('child_process');

/**
 * Test runner script that executes all MFE tests and provides a summary
 */

const MFE_APPS = [
  { name: 'container', workspace: '@mfe-demo/container' },
  { name: 'home', workspace: '@mfe-demo/home' },
  { name: 'preferences', workspace: '@mfe-demo/preferences' },
  { name: 'account', workspace: '@mfe-demo/account' },
  { name: 'admin', workspace: '@mfe-demo/admin' },
];

const results = [];
let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
let totalTestFiles = 0;

console.log('Running tests for all MFEs with coverage...\n');

for (const app of MFE_APPS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${app.name.toUpperCase()}...`);
  console.log('='.repeat(60));

  const startTime = Date.now();
  try {
    const output = execSync(`yarn workspace ${app.workspace} test:unit --coverage`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print the output
    console.log(output);

    // Strip ANSI color codes for parsing
    const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');

    // Parse output to get test counts
    // Vitest outputs: "Test Files  X passed (X)" and "Tests  Y passed (Y)"
    const testFilesMatch = cleanOutput.match(/Test Files\s+(\d+)\s+passed/);
    const testsMatch = cleanOutput.match(/Tests\s+(\d+)\s+passed/);

    const testFiles = testFilesMatch ? parseInt(testFilesMatch[1]) : 0;
    const tests = testsMatch ? parseInt(testsMatch[1]) : 0;

    totalTestFiles += testFiles;
    totalTests += tests;
    totalPassed += tests;

    // Parse coverage data
    // Example line: "All files          |   44.29 |    58.47 |   60.86 |   44.29 |"
    const coverageMatch = cleanOutput.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|/);
    let coverage = null;
    if (coverageMatch) {
      coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      };
    }

    results.push({
      name: app.name,
      status: 'passed',
      duration,
      testFiles,
      tests,
      coverage,
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print error output
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());

    // Try to parse test counts from error output
    const output = error.stdout ? error.stdout.toString() : '';
    const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
    const testFilesMatch = cleanOutput.match(/Test Files\s+(\d+)\s+failed.*?(\d+)\s+passed/);
    const testsMatch = cleanOutput.match(/Tests\s+(\d+)\s+failed.*?(\d+)\s+passed/);

    const testFiles = testFilesMatch ? parseInt(testFilesMatch[2]) : 0;
    const failedTestFiles = testFilesMatch ? parseInt(testFilesMatch[1]) : 0;
    const tests = testsMatch ? parseInt(testsMatch[2]) : 0;
    const failedTests = testsMatch ? parseInt(testsMatch[1]) : 0;

    totalTestFiles += testFiles + failedTestFiles;
    totalTests += tests + failedTests;
    totalPassed += tests;
    totalFailed += failedTests;

    // Try to parse coverage even if tests failed
    const coverageMatch = cleanOutput.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|/);
    let coverage = null;
    if (coverageMatch) {
      coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      };
    }

    results.push({
      name: app.name,
      status: 'failed',
      duration,
      testFiles: testFiles + failedTestFiles,
      tests: tests + failedTests,
      failed: failedTests,
      coverage,
    });
  }
}

console.log('\n');
console.log('='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));

// Display summary table
console.log('\nResults by MFE:');
console.log('-'.repeat(60));
console.log('MFE'.padEnd(20) + 'Status'.padEnd(15) + 'Tests'.padEnd(12) + 'Duration');
console.log('-'.repeat(60));

for (const result of results) {
  const statusIcon = result.status === 'passed' ? '✓' : '✗';
  const statusText = result.status === 'passed' ? 'PASSED' : 'FAILED';
  const testsText = result.failed ? `${result.tests} (${result.failed} failed)` : `${result.tests}`;
  console.log(
    `${result.name.padEnd(20)}${(statusIcon + ' ' + statusText).padEnd(15)}${testsText.padEnd(12)}${result.duration}s`
  );
}

console.log('-'.repeat(60));

// Check if all passed
const allPassed = results.every(r => r.status === 'passed');
const passedMFEs = results.filter(r => r.status === 'passed').length;
const failedMFEs = results.filter(r => r.status === 'failed').length;

console.log(`\nTotal Test Files: ${totalTestFiles}`);
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPassed}`);
if (totalFailed > 0) {
  console.log(`Failed: ${totalFailed}`);
}
console.log(`MFEs: ${passedMFEs}/${results.length} passed`);

// Display coverage summary
console.log('\n' + '='.repeat(60));
console.log('CODE COVERAGE');
console.log('='.repeat(60));
console.log('\nCoverage by MFE:');
console.log('-'.repeat(80));
console.log('MFE'.padEnd(20) + 'Statements'.padEnd(15) + 'Branches'.padEnd(15) + 'Functions'.padEnd(15) + 'Lines');
console.log('-'.repeat(80));

for (const result of results) {
  if (result.coverage) {
    console.log(
      `${result.name.padEnd(20)}${(result.coverage.statements + '%').padEnd(15)}${(result.coverage.branches + '%').padEnd(15)}${(result.coverage.functions + '%').padEnd(15)}${result.coverage.lines + '%'}`
    );
  } else {
    console.log(`${result.name.padEnd(20)}N/A`.padEnd(80));
  }
}

console.log('-'.repeat(80));

// Calculate average coverage across all MFEs
const mfesWithCoverage = results.filter(r => r.coverage);
if (mfesWithCoverage.length > 0) {
  const avgStatements =
    mfesWithCoverage.reduce((sum, r) => sum + r.coverage.statements, 0) / mfesWithCoverage.length;
  const avgBranches =
    mfesWithCoverage.reduce((sum, r) => sum + r.coverage.branches, 0) / mfesWithCoverage.length;
  const avgFunctions =
    mfesWithCoverage.reduce((sum, r) => sum + r.coverage.functions, 0) / mfesWithCoverage.length;
  const avgLines =
    mfesWithCoverage.reduce((sum, r) => sum + r.coverage.lines, 0) / mfesWithCoverage.length;

  console.log(
    `\n${'Average'.padEnd(20)}${avgStatements.toFixed(2) + '%'.padEnd(14)}${avgBranches.toFixed(2) + '%'.padEnd(14)}${avgFunctions.toFixed(2) + '%'.padEnd(14)}${avgLines.toFixed(2) + '%'}`
  );
}

if (allPassed) {
  console.log('\n✓ All tests passed successfully!\n');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review the output above.\n');
  process.exit(1);
}
