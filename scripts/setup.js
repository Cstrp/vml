#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Configuration
const config = {
  dataDir: path.join(projectRoot, 'data'),
  whisperDir: path.join(projectRoot, 'data', 'libs', 'whisper'),
  modelsDir: path.join(projectRoot, 'data', 'models'),
  whisperModel: process.env.WHISPER_MODEL || 'base.en',
}

console.log('🚀 Setting up AI Video Creator models and dependencies...')
console.log('📁 Data directory:', config.dataDir)

/**
 * Execute command with error handling
 */
function runCommand(command, description, options = {}) {
  console.log(`\n🔧 ${description}...`)
  try {
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: projectRoot,
      ...options,
    })
    console.log(`✅ ${description} completed successfully`)
    return result
  } catch (error) {
    console.error(`❌ Failed to ${description.toLowerCase()}:`)
    console.error(error.message)
    throw error
  }
}

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' })
    return true
  } catch (error) {
    console.warn(`⚠️ Command '${command}' not found`, error.message)
    return false
  }
}

/**
 * Setup Whisper.cpp for audio transcription
 */
async function setupWhisper() {
  console.log('\n📢 Setting up Whisper.cpp for audio transcription...')

  // Create whisper directory
  await fs.ensureDir(config.whisperDir)

  // Check if whisper is already set up
  const whisperBinary = path.join(config.whisperDir, 'main')
  if (await fs.pathExists(whisperBinary)) {
    console.log('✅ Whisper.cpp already installed')
    return
  }

  console.log('📥 Downloading Whisper.cpp...')

  // Clone whisper.cpp repository
  runCommand(
    `git clone https://github.com/ggml-org/whisper.cpp.git ${config.whisperDir}`,
    'Cloning Whisper.cpp repository'
  )

  // Checkout specific version for stability
  runCommand('git checkout v1.7.1', 'Checking out Whisper.cpp v1.7.1', {
    cwd: config.whisperDir,
  })

  // Build whisper
  runCommand('make', 'Building Whisper.cpp', { cwd: config.whisperDir })

  // Download model
  const modelsDir = path.join(config.whisperDir, 'models')
  runCommand(
    `sh ./download-ggml-model.sh ${config.whisperModel}`,
    `Downloading Whisper model: ${config.whisperModel}`,
    { cwd: modelsDir }
  )

  console.log('✅ Whisper.cpp setup completed')
}

/**
 * Check and setup FFmpeg
 */
async function setupFFmpeg() {
  console.log('\n🎬 Checking FFmpeg installation...')

  if (commandExists('ffmpeg')) {
    console.log('✅ FFmpeg is already installed')
    // Check version
    try {
      execSync('ffmpeg -version', { stdio: 'inherit' })
    } catch (error) {
      console.warn('⚠️ FFmpeg found but version check failed:', error.message)
    }
  } else {
    console.log('❌ FFmpeg not found')
    console.log('📝 Please install FFmpeg:')
    console.log('   Ubuntu/Debian: sudo apt install ffmpeg')
    console.log('   macOS: brew install ffmpeg')
    console.log('   Windows: Download from https://ffmpeg.org/download.html')
    throw new Error('FFmpeg is required but not installed')
  }
}

/**
 * Setup data directories
 */
async function setupDirectories() {
  console.log('\n📁 Creating data directories...')

  const directories = [
    config.dataDir,
    config.modelsDir,
    path.join(config.dataDir, 'temp'),
    path.join(config.dataDir, 'videos'),
    path.join(config.dataDir, 'cache'),
  ]

  for (const dir of directories) {
    await fs.ensureDir(dir)
    console.log(`✅ Created directory: ${dir}`)
  }
}

/**
 * Create environment configuration
 */
async function createEnvConfig() {
  console.log('\n⚙️ Creating environment configuration...')

  const envConfig = {
    DATA_DIR_PATH: config.dataDir,
    WHISPER_PATH: path.join(config.whisperDir, 'main'),
    WHISPER_MODEL_PATH: path.join(
      config.whisperDir,
      'models',
      `ggml-${config.whisperModel}.bin`
    ),
    WHISPER_MODEL: config.whisperModel,
    PRODUCTION_MODE: 'true',
    VIDEO_CACHE_SIZE_IN_BYTES: '2097152000', // 2GB
    MAX_CONCURRENT_VIDEOS: '1',
  }

  // Create .env.local file
  const envFile = path.join(projectRoot, '.env.local')
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  await fs.writeFile(envFile, envContent)
  console.log(`✅ Environment configuration written to: ${envFile}`)

  // Display configuration
  console.log('\n📋 Configuration:')
  Object.entries(envConfig).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`)
  })
}

/**
 * Verify setup
 */
async function verifySetup() {
  console.log('\n🔍 Verifying setup...')

  const checks = [
    {
      name: 'Whisper binary',
      path: path.join(config.whisperDir, 'main'),
      required: true,
    },
    {
      name: 'Whisper model',
      path: path.join(
        config.whisperDir,
        'models',
        `ggml-${config.whisperModel}.bin`
      ),
      required: true,
    },
    {
      name: 'FFmpeg command',
      check: () => commandExists('ffmpeg'),
      required: true,
    },
    {
      name: 'Data directory',
      path: config.dataDir,
      required: true,
    },
  ]

  let allPassed = true

  for (const check of checks) {
    const name = check.name
    let passed = false

    if (check.path) {
      passed = await fs.pathExists(check.path)
    } else if (check.check) {
      passed = check.check()
    }

    if (passed) {
      console.log(`✅ ${name}`)
    } else {
      console.log(`❌ ${name}`)
      if (check.required) {
        allPassed = false
      }
    }
  }

  if (allPassed) {
    console.log('\n🎉 Setup completed successfully!')
    console.log('🚀 You can now start the application in production mode')
  } else {
    console.log('\n❌ Setup incomplete. Please resolve the issues above.')
    process.exit(1)
  }
}

/**
 * Main setup function
 */
async function main() {
  try {
    console.log('🔧 Checking system dependencies...')

    // Check required system tools
    const requiredCommands = ['git', 'make', 'cmake']
    for (const cmd of requiredCommands) {
      if (!commandExists(cmd)) {
        throw new Error(
          `Required command '${cmd}' not found. Please install build tools.`
        )
      }
    }

    console.log('✅ Required system tools found')

    // Run setup steps
    await setupDirectories()
    await setupFFmpeg()
    await setupWhisper()
    await createEnvConfig()
    await verifySetup()
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  setupWhisper,
  setupFFmpeg,
  setupDirectories,
  createEnvConfig,
  verifySetup,
}
