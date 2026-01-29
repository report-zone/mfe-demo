#!/usr/bin/env node

/**
 * MFE Removal Script
 *
 * This script removes an existing Micro Frontend application and:
 * - Deletes the MFE directory
 * - Removes all integration file references:
 *   - Root package.json scripts
 *   - Container Navbar translations
 *   - Container Navbar.tsx navigation items
 *   - Container mfeRegistry.ts (ports, switch cases, registry entries)
 *   - Container routeMappings.ts
 *   - Container App.tsx MFE loader entries
 *   - Container vite.config.ts aliases
 *   - Container tsconfig.json path mappings
 *   - Container vite-env.d.ts module declarations
 *   - Container vite-plugin-mfe-remote.ts MFE packages
 *   - scripts/run-production-local.js
 *   - scripts/deploy-all.sh
 *   - scripts/deploy.sh
 *   - deployment/deploy-apps.sh
 *
 * Usage:
 *   node scripts/remove-mfe.js              # Interactive mode
 *   node scripts/remove-mfe.js <mfe-name>   # Non-interactive (with --force flag for no confirmation)
 *   node scripts/remove-mfe.js <mfe-name> --force
 *   OR
 *   yarn remove-mfe
 *   yarn remove-mfe <mfe-name>
 *   yarn remove-mfe <mfe-name> --force
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const projectRoot = path.join(__dirname, '..');
const appsDir = path.join(projectRoot, 'apps');

// Parse command line arguments
const args = process.argv.slice(2);
const mfeNameArg = args.find(arg => !arg.startsWith('--'));
const forceFlag = args.includes('--force');

// Get list of MFEs (excluding container)
const getMFEList = () => {
  const apps = fs.readdirSync(appsDir).filter(dir => {
    const appPath = path.join(appsDir, dir);
    return fs.statSync(appPath).isDirectory() && dir !== 'container';
  });
  return apps;
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

// Helper functions
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const pascalCase = (str) => str.split('-').map(capitalize).join('');

// Helper function to update JSON file with error handling
function updateJsonFile(filePath, updateFn) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    updateFn(json);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

// Helper function to delete directory recursively
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Remove MFE function
async function removeMFE(mfeName) {
  const mfeNamePascal = pascalCase(mfeName);
  const mfeDir = path.join(appsDir, mfeName);

  console.log(`\n🗑️  Removing MFE: ${mfeName}`);
  console.log(`   Directory: ${mfeDir}\n`);

  // 1. Delete MFE directory
  try {
    deleteDirectory(mfeDir);
    console.log(`📁 Deleted: apps/${mfeName}/`);
  } catch (error) {
    console.error(`❌ Error deleting MFE directory: ${error.message}`);
    return false;
  }

  // 2. Update root package.json
  const rootPackageJson = path.join(projectRoot, 'package.json');
  updateJsonFile(rootPackageJson, (pkg) => {
    // Remove individual scripts
    delete pkg.scripts[`dev:${mfeName}`];
    delete pkg.scripts[`build:${mfeName}`];
    delete pkg.scripts[`preview:${mfeName}`];
    delete pkg.scripts[`test:unit:${mfeName}`];

    // Remove from combined dev script
    pkg.scripts.dev = pkg.scripts.dev.replace(` "yarn dev:${mfeName}"`, '');

    // Remove from combined build script
    pkg.scripts.build = pkg.scripts.build.replace(` && yarn build:${mfeName}`, '');

    // Remove from combined preview script
    pkg.scripts.preview = pkg.scripts.preview.replace(` "yarn preview:${mfeName}"`, '');

    // Remove from test:unit:all script
    pkg.scripts['test:unit:all'] = pkg.scripts['test:unit:all'].replace(` && yarn test:unit:${mfeName}`, '');

    // Remove from clean script
    pkg.scripts.clean = pkg.scripts.clean.replace(` && cd ../${mfeName} && rm -rf node_modules dist`, '');
  });
  console.log('📦 Updated: package.json');

  // 3. Update container navbar translations (all languages)
  const containerLocales = ['en', 'fr', 'de', 'zh', 'es', 'ja'];
  containerLocales.forEach((lang) => {
    const localePath = path.join(projectRoot, 'apps/container/src/i18n/locales', `${lang}.json`);
    updateJsonFile(localePath, (json) => {
      if (json.navbar && json.navbar[mfeName]) {
        delete json.navbar[mfeName];
      }
    });
    console.log(`🌐 Updated: apps/container/src/i18n/locales/${lang}.json`);
  });

  // 4. Update container Navbar.tsx
  const navbarPath = path.join(projectRoot, 'apps/container/src/components/Navbar.tsx');
  try {
    let navbarContent = fs.readFileSync(navbarPath, 'utf8');
    // Remove the nav item entry
    const navItemRegex = new RegExp(`\\n  \\{ path: '/${mfeName}', labelKey: 'navbar\\.${mfeName}' \\},`, 'g');
    navbarContent = navbarContent.replace(navItemRegex, '');
    fs.writeFileSync(navbarPath, navbarContent);
    console.log('🧭 Updated: apps/container/src/components/Navbar.tsx');
  } catch (error) {
    console.error(`❌ Error updating Navbar.tsx: ${error.message}`);
  }

  // 5. Update container mfeRegistry.ts
  const mfeRegistryPath = path.join(projectRoot, 'apps/container/src/config/mfeRegistry.ts');
  try {
    let registryContent = fs.readFileSync(mfeRegistryPath, 'utf8');

    // Remove port mapping
    const portRegex = new RegExp(`\\n    ${mfeName}: \\d+,`, 'g');
    registryContent = registryContent.replace(portRegex, '');

    // Clean up any extra blank lines before the closing brace of the ports object
    registryContent = registryContent.replace(/,\n\s*\n(\s*\};)/, ',\n$1');

    // Remove case in switch statement
    const caseRegex = new RegExp(`\\n        case '${mfeName}':\\n          return import\\('@mfe-demo/${mfeName}'\\);`, 'g');
    registryContent = registryContent.replace(caseRegex, '');

    // Remove registry entry
    const registryEntryRegex = new RegExp(
      `\\n  ${mfeName}: \\{\\n    name: '${mfeNamePascal}',\\n    loadComponent: createMFELoader\\('${mfeName}'\\),\\n    description: '${mfeNamePascal} micro frontend',\\n  \\},`,
      'g'
    );
    registryContent = registryContent.replace(registryEntryRegex, '');

    fs.writeFileSync(mfeRegistryPath, registryContent);
    console.log('📋 Updated: apps/container/src/config/mfeRegistry.ts');
  } catch (error) {
    console.error(`❌ Error updating mfeRegistry.ts: ${error.message}`);
  }

  // 6. Update container routeMappings.ts
  const routeMappingsPath = path.join(projectRoot, 'apps/container/src/config/routeMappings.ts');
  try {
    let routeContent = fs.readFileSync(routeMappingsPath, 'utf8');
    const routeRegex = new RegExp(`\\n  \\{ pattern: '/${mfeName}', mfeName: '${mfeName}', exact: true \\},`, 'g');
    routeContent = routeContent.replace(routeRegex, '');
    fs.writeFileSync(routeMappingsPath, routeContent);
    console.log('🛤️  Updated: apps/container/src/config/routeMappings.ts');
  } catch (error) {
    console.error(`❌ Error updating routeMappings.ts: ${error.message}`);
  }

  // 7. Update container App.tsx to remove MFE loader entry
  const appTsxPath = path.join(projectRoot, 'apps/container/src/App.tsx');
  try {
    let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
    // Remove the MFE loader block - use a more flexible regex that matches whitespace variations
    // Pattern matches: {mountedMFEs.has('mfeName') && ( <Box ...> <MFELoader /> </Box> )}
    const mfeLoaderRegex = new RegExp(
      `\\s*\\{mountedMFEs\\.has\\(['"]${mfeName}['"]\\)\\s*&&\\s*\\([\\s\\S]*?<MFELoader\\s+mfeName=["']${mfeName}["']\\s*\\/>[\\s\\S]*?<\\/Box>[\\s\\S]*?\\)\\}`,
      'g'
    );
    appTsxContent = appTsxContent.replace(mfeLoaderRegex, '');
    fs.writeFileSync(appTsxPath, appTsxContent);
    console.log('📱 Updated: apps/container/src/App.tsx');
  } catch (error) {
    console.error(`❌ Error updating App.tsx: ${error.message}`);
  }

  // 8. Update container vite.config.ts
  const containerViteConfigPath = path.join(projectRoot, 'apps/container/vite.config.ts');
  try {
    let viteConfigContent = fs.readFileSync(containerViteConfigPath, 'utf8');

    // Remove from hasRemoteUrls check
    const envVarRegex = new RegExp(` &&\\n    process\\.env\\.VITE_MFE_${mfeName.toUpperCase()}_URL`, 'g');
    viteConfigContent = viteConfigContent.replace(envVarRegex, '');

    // Remove alias
    const aliasRegex = new RegExp(`\\n        '@mfe-demo/${mfeName}': path\\.resolve\\(__dirname, '\\.\\./${mfeName}/src/main\\.tsx'\\),`, 'g');
    viteConfigContent = viteConfigContent.replace(aliasRegex, '');

    fs.writeFileSync(containerViteConfigPath, viteConfigContent);
    console.log('⚙️  Updated: apps/container/vite.config.ts');
  } catch (error) {
    console.error(`❌ Error updating vite.config.ts: ${error.message}`);
  }

  // 8b. Update container tsconfig.json to remove TypeScript path mapping
  const containerTsConfigPath = path.join(projectRoot, 'apps/container/tsconfig.json');
  try {
    let tsConfigContent = fs.readFileSync(containerTsConfigPath, 'utf8');
    const originalContent = tsConfigContent;

    // Remove the path mapping for this MFE (multi-line format from JSON.stringify)
    // Pattern matches:
    //       "@mfe-demo/mfeName": [
    //         "../mfeName/src/main.tsx"
    //       ],
    const multiLineRegex = new RegExp(
      `,?\\n      "@mfe-demo/${mfeName}": \\[\\n        "\\.\\./${mfeName}/src/main\\.tsx"\\n      \\]`,
      'g'
    );
    tsConfigContent = tsConfigContent.replace(multiLineRegex, '');

    // Also try single-line format as fallback
    const singleLineRegex = new RegExp(
      `,?\\n      "@mfe-demo/${mfeName}": \\["\\.\\./${mfeName}/src/main\\.tsx"\\]`,
      'g'
    );
    tsConfigContent = tsConfigContent.replace(singleLineRegex, '');

    if (tsConfigContent !== originalContent) {
      fs.writeFileSync(containerTsConfigPath, tsConfigContent);
      console.log('📝 Updated: apps/container/tsconfig.json');
    }
  } catch (error) {
    console.error(`❌ Error updating tsconfig.json: ${error.message}`);
  }

  // 8c. Update container vite-env.d.ts to remove TypeScript module declaration
  const viteEnvPath = path.join(projectRoot, 'apps/container/src/vite-env.d.ts');
  try {
    let viteEnvContent = fs.readFileSync(viteEnvPath, 'utf8');

    // Remove the module declaration block for this MFE
    const moduleDeclarationRegex = new RegExp(
      `\\n*declare module '@mfe-demo/${mfeName}' \\{\\n  import \\{ ComponentType \\} from 'react';\\n  const component: ComponentType;\\n  export default component;\\n\\}\\n?`,
      'g'
    );
    viteEnvContent = viteEnvContent.replace(moduleDeclarationRegex, '');

    // Ensure file ends with a newline
    if (!viteEnvContent.endsWith('\n')) {
      viteEnvContent = viteEnvContent + '\n';
    }

    fs.writeFileSync(viteEnvPath, viteEnvContent);
    console.log('📝 Updated: apps/container/src/vite-env.d.ts');
  } catch (error) {
    console.error(`❌ Error updating vite-env.d.ts: ${error.message}`);
  }

  // 8d. Update container vite-plugin-mfe-remote.ts to remove MFE package
  const mfeRemotePluginPath = path.join(projectRoot, 'apps/container/vite-plugin-mfe-remote.ts');
  try {
    let mfeRemoteContent = fs.readFileSync(mfeRemotePluginPath, 'utf8');

    // Remove the MFE package from the mfePackages array
    const mfePackageRegex = new RegExp(`\\n        '@mfe-demo/${mfeName}',`, 'g');
    mfeRemoteContent = mfeRemoteContent.replace(mfePackageRegex, '');

    fs.writeFileSync(mfeRemotePluginPath, mfeRemoteContent);
    console.log('🔌 Updated: apps/container/vite-plugin-mfe-remote.ts');
  } catch (error) {
    console.error(`❌ Error updating vite-plugin-mfe-remote.ts: ${error.message}`);
  }

  // 9. Update scripts/run-production-local.js
  const prodLocalPath = path.join(projectRoot, 'scripts/run-production-local.js');
  try {
    let prodLocalContent = fs.readFileSync(prodLocalPath, 'utf8');

    // Remove from APPS array
    prodLocalContent = prodLocalContent.replace(`, '${mfeName}'`, '');

    // Remove access point log
    const logRegex = new RegExp(`\\n    console\\.log\\('   ${mfeNamePascal}:.*?http://localhost:\\d+'\\);`, 'g');
    prodLocalContent = prodLocalContent.replace(logRegex, '');

    fs.writeFileSync(prodLocalPath, prodLocalContent);
    console.log('🏃 Updated: scripts/run-production-local.js');
  } catch (error) {
    console.error(`❌ Error updating run-production-local.js: ${error.message}`);
  }

  // 10. Update scripts/deploy-all.sh
  const deployAllPath = path.join(projectRoot, 'scripts/deploy-all.sh');
  try {
    let deployAllContent = fs.readFileSync(deployAllPath, 'utf8');
    deployAllContent = deployAllContent.replace(` ${mfeName}`, '');
    fs.writeFileSync(deployAllPath, deployAllContent);
    console.log('🚀 Updated: scripts/deploy-all.sh');
  } catch (error) {
    console.error(`❌ Error updating deploy-all.sh: ${error.message}`);
  }

  // 11. Update scripts/deploy.sh
  const deployPath = path.join(projectRoot, 'scripts/deploy.sh');
  try {
    let deployContent = fs.readFileSync(deployPath, 'utf8');

    // Update echo for available apps
    deployContent = deployContent.replace(`, ${mfeName}"`, '"');
    deployContent = deployContent.replace(`, ${mfeName}`, '');

    // Update regex validation
    deployContent = deployContent.replace(`|${mfeName}`, '');

    fs.writeFileSync(deployPath, deployContent);
    console.log('📤 Updated: scripts/deploy.sh');
  } catch (error) {
    console.error(`❌ Error updating deploy.sh: ${error.message}`);
  }

  // 12. Update deployment/deploy-apps.sh
  const deployAppsPath = path.join(projectRoot, 'deployment/deploy-apps.sh');
  try {
    let deployAppsContent = fs.readFileSync(deployAppsPath, 'utf8');

    // Remove MFE remote URL settings
    const envExportRegex = new RegExp(`\\n    export VITE_MFE_${mfeName.toUpperCase()}_URL="\\$\\{WEBSITE_URL\\}/${mfeName}"`, 'g');
    deployAppsContent = deployAppsContent.replace(envExportRegex, '');

    const printInfoRegex = new RegExp(`\\n    print_info "  - ${mfeNamePascal}: \\$\\{VITE_MFE_${mfeName.toUpperCase()}_URL\\}"`, 'g');
    deployAppsContent = deployAppsContent.replace(printInfoRegex, '');

    // Remove from APPS array
    deployAppsContent = deployAppsContent.replace(` "${mfeName}"`, '');

    fs.writeFileSync(deployAppsPath, deployAppsContent);
    console.log('☁️  Updated: deployment/deploy-apps.sh');
  } catch (error) {
    console.error(`❌ Error updating deploy-apps.sh: ${error.message}`);
  }

  console.log('\n✅ MFE removal complete!\n');
  console.log('📋 Next steps:\n');
  console.log(`   1. Run 'yarn install' to update dependencies`);
  console.log(`   2. Run 'yarn dev' to verify the remaining MFEs work correctly`);
  console.log('\n🎉 MFE removal finished!');

  return true;
}

// Main function
async function main() {
  const mfeList = getMFEList();

  if (mfeList.length === 0) {
    console.log('\n❌ No MFEs found to remove (excluding container).\n');
    rl.close();
    process.exit(0);
  }

  // Non-interactive mode: MFE name provided as command line argument
  if (mfeNameArg) {
    if (!mfeList.includes(mfeNameArg)) {
      console.error(`\n❌ Error: MFE "${mfeNameArg}" not found.`);
      console.log('\nAvailable MFEs:');
      mfeList.forEach((mfe) => console.log(`  - ${mfe}`));
      console.log('');
      rl.close();
      process.exit(1);
    }

    if (!forceFlag) {
      console.log(`\n⚠️  You are about to remove: ${mfeNameArg}`);
      console.log('   This will delete the MFE directory and all integration references.');
      console.log('   This action cannot be undone.\n');

      const confirm = await question(`Type "${mfeNameArg}" to confirm removal: `);

      if (confirm !== mfeNameArg) {
        console.log('\n👋 Removal cancelled (confirmation did not match).\n');
        rl.close();
        process.exit(0);
      }
    } else {
      console.log(`\n🗑️  Force removing MFE: ${mfeNameArg}\n`);
    }

    const success = await removeMFE(mfeNameArg);
    rl.close();
    process.exit(success ? 0 : 1);
  }

  // Interactive mode
  console.log('\n🗑️  MFE Removal Script\n');
  console.log('Available MFEs to remove:\n');
  mfeList.forEach((mfe, index) => {
    console.log(`  ${index + 1}. ${mfe}`);
  });
  console.log('');

  const selection = await question('Enter the number of the MFE to remove (or "q" to quit): ');

  if (selection.toLowerCase() === 'q') {
    console.log('\n👋 Removal cancelled.\n');
    rl.close();
    process.exit(0);
  }

  const selectedIndex = parseInt(selection, 10) - 1;

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= mfeList.length) {
    console.log('\n❌ Invalid selection.\n');
    rl.close();
    process.exit(1);
  }

  const selectedMFE = mfeList[selectedIndex];

  console.log(`\n⚠️  You are about to remove: ${selectedMFE}`);
  console.log('   This will delete the MFE directory and all integration references.');
  console.log('   This action cannot be undone.\n');

  const confirm = await question(`Type "${selectedMFE}" to confirm removal: `);

  if (confirm !== selectedMFE) {
    console.log('\n👋 Removal cancelled (confirmation did not match).\n');
    rl.close();
    process.exit(0);
  }

  const success = await removeMFE(selectedMFE);
  rl.close();
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
