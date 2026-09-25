const { execSync } = require('child_process');

let isPushing = false;

function autoSync() {
  if (isPushing) return;
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      isPushing = true;
      console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 Changes detected, auto-pushing to GitHub...`);
      execSync('git add .', { stdio: 'inherit' });
      
      const commitMessage = `auto-sync: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      console.log(`[${new Date().toLocaleTimeString()}] 🚀 Pushing to GitHub origin/main...`);
      execSync('git push origin main', { stdio: 'inherit' });
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Auto-push completed successfully!\n`);
    }
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Auto-push warning:`, err.message);
  } finally {
    isPushing = false;
  }
}

console.log('👀 AMS+ GitHub Auto-Sync Daemon started. Monitoring for changes...');
// Initial check
autoSync();
// Check every 5 seconds
setInterval(autoSync, 5000);
