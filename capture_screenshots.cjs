const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Users\\ACER\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 3000;
const URL = `http://localhost:${PORT}`;

const mockUser = {
  id: 1,
  name: 'Arief Sidik Wijayanto',
  email: 'arfwjn@gmail.com',
  nim: 'STI202303494',
  semester: 4,
  major: 'Teknik Informatika',
  profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFoYkxvSC3Tl7Lha5JHOML3Cc2hYx5Hhoh_yA__QxGX6rbapw7zZtOvOWuvFsVnxR6nNGtzUzrFVJFfu_G8hudADmzAZDH1shSH7Mr3tS3ufjyGaU-d9hD3ArSwarBm1TR6cXqN2MiMoTBst4W8NxtPjM2uwHLLKhojSWGvUBep5mGtAO3VbZakDBXlptVD5J5wPcgTnWXzbc81YIbapCO5hSMDAgnhL_lL7dx-K2jpfWn0MgiODu-J2up9aV3_2Kd9JpojgjSs9g4',
  gpa_current: 3.75,
  gpa_target: 3.85,
  target_study_hours: 3,
  address: 'Purwokerto, Jawa Tengah'
};

const screens = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'calendar', label: 'Jadwal' },
  { key: 'attendance', label: 'Absensi' },
  { key: 'workspace', label: 'Ruang Belajar' },
  { key: 'notes', label: 'Catatan' }
];

// Function to check if server is responsive
function checkServer() {
  return new Promise((resolve) => {
    http.get(URL, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Function to wait for server to start
async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  console.log(`Waiting for dev server to start on port ${PORT}...`);
  while (Date.now() - start < timeoutMs) {
    const ok = await checkServer();
    if (ok) {
      console.log('Dev server is up and running!');
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Dev server failed to start in time.');
}

async function captureAllScreens(page, publicDir, theme) {
  console.log(`\n>>> CAPTURING ALL SCREENS FOR THEME: ${theme.toUpperCase()}`);
  for (const scr of screens) {
    console.log(`Navigating to tab: "${scr.label}" (${scr.key})...`);
    const clicked = await page.evaluate((label) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.trim().includes(label));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, scr.label);

    if (!clicked && scr.key !== 'today') {
      console.error(`Warning: Could not find button for tab "${scr.label}"`);
    }

    // Wait for render/data load
    await new Promise((r) => setTimeout(r, 3000));

    const screenshotPath = path.join(publicDir, `planly_${scr.key}_${theme}.png`);
    console.log(`Capturing screenshot for planly_${scr.key}_${theme}.png...`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot: ${screenshotPath}`);
  }
}

async function run() {
  console.log('Starting Vite development server...');
  const devServer = spawn('npm.cmd', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  devServer.stdout.on('data', (data) => {
    console.log(`[Vite Out]: ${data.toString().trim()}`);
  });

  devServer.stderr.on('data', (data) => {
    console.error(`[Vite Err]: ${data.toString().trim()}`);
  });

  let browser;
  try {
    // Wait for the dev server to start responding
    await waitForServer();

    console.log('Launching Puppeteer Chrome with fake media stream options...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // --- STEP 1: INITIALIZE LIGHT MODE ---
    console.log(`Navigating to ${URL} to set localStorage to Light theme...`);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.evaluate((user) => {
      localStorage.setItem('planly_auth', 'true');
      localStorage.setItem('planly_theme', 'light');
      localStorage.setItem('planly_user', JSON.stringify(user));
    }, mockUser);

    console.log('Reloading page to apply light state...');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 4000));

    // --- STEP 2: CAPTURE LIGHT MODE SCREENS ---
    await captureAllScreens(page, publicDir, 'light');

    // --- STEP 3: TOGGLE TO DARK MODE VIA APPLICATION UI ---
    console.log('\nToggling theme to Dark Mode via header settings dropdown...');
    
    // Click settings gear button
    const settingsBtn = await page.$('button[aria-label="Pengaturan Cepat"]');
    if (!settingsBtn) {
      throw new Error('Could not find Settings gear button in header.');
    }
    await settingsBtn.click();
    console.log('Settings dropdown opened.');
    await new Promise((r) => setTimeout(r, 1000));

    // Click "Gelap" button
    const darkClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.trim() === 'Gelap');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!darkClicked) {
      throw new Error('Could not find "Gelap" theme toggle button in settings dropdown.');
    }
    console.log('Clicked "Gelap" button.');
    await new Promise((r) => setTimeout(r, 1000));

    // Close settings dropdown by clicking gear again
    await settingsBtn.click();
    console.log('Settings dropdown closed.');
    await new Promise((r) => setTimeout(r, 2000));

    // --- STEP 4: CAPTURE DARK MODE SCREENS ---
    await captureAllScreens(page, publicDir, 'dark');

    console.log('\nAll screenshots captured successfully!');

  } catch (error) {
    console.error('An error occurred during execution:', error);
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
    console.log('Stopping dev server...');
    // Kill the spawned dev server process
    if (devServer) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', devServer.pid, '/f', '/t']);
      } else {
        devServer.kill('SIGINT');
      }
    }
    console.log('Done.');
    process.exit(0);
  }
}

run();
