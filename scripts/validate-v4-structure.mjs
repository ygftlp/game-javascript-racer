import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;

function checkFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    console.error(`Missing file: ${file}`);
    failures += 1;
  }
}

function checkDir(dir) {
  const fullPath = path.join(root, dir);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    console.error(`Missing directory: ${dir}`);
    failures += 1;
  }
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function checkContains(file, text) {
  const content = read(file);
  if (!content.includes(text)) {
    console.error(`Missing expected text in ${file}: ${text}`);
    failures += 1;
  }
}

function checkScriptOrder(htmlFile, scripts) {
  const html = read(htmlFile);
  let lastIndex = -1;

  for (const script of scripts) {
    const marker = `<script src="${script}"></script>`;
    const index = html.indexOf(marker);

    if (index < 0) {
      console.error(`Missing script in ${htmlFile}: ${script}`);
      failures += 1;
      continue;
    }

    if (index < lastIndex) {
      console.error(`Script order error in ${htmlFile}: ${script}`);
      failures += 1;
    }

    lastIndex = index;
  }
}

const requiredFiles = [
  'index.html',
  'v1.straight.html',
  'v2.curves.html',
  'v3.hills.html',
  'v4.final.html',
  'common.js',
  'common.css',
  'stats.js',
  'js/v4/core/app.js',
  'js/v4/core/state.js',
  'js/v4/core/game.js',
  'js/v4/content/config.js',
  'js/v4/content/assets.js',
  'js/v4/content/background-map.js',
  'js/v4/content/sprite-map.js',
  'js/v4/integrations/platform.js',
  'js/v4/integrations/ads.js',
  'js/v4/integrations/analytics.js',
  'js/v4/systems/save.js',
  'js/v4/ui/hud.js',
  'js/v4/ui/input.js',
  'js/v4/ui/tweak-ui.js',
  'js/v4/gameplay/track.js',
  'js/v4/gameplay/traffic.js',
  'js/v4/rendering/renderer.js',
  'docs/project-structure.md',
  'docs/architecture.md',
  'docs/roadmap.md',
  'docs/commercialization.md',
  'docs/assets.md'
];

const requiredDirs = [
  'assets/packs/default/images',
  'assets/packs/default/audio/music',
  'assets/packs/default/audio/sfx',
  'assets/packs/default/ui',
  'assets/packs/default/branding',
  'assets/packs/default/tracks',
  'assets/packs/default/skins',
  'js/v4/core',
  'js/v4/content',
  'js/v4/gameplay',
  'js/v4/integrations',
  'js/v4/rendering',
  'js/v4/scenes',
  'js/v4/systems',
  'js/v4/ui'
];

const removedRuntimeFiles = [
  'js/v4/app.js',
  'js/v4/state.js',
  'js/v4/game.js',
  'js/v4/config.js',
  'js/v4/assets.js',
  'js/v4/background-map.js',
  'js/v4/sprite-map.js',
  'js/v4/platform.js',
  'js/v4/ads.js',
  'js/v4/analytics.js',
  'js/v4/save.js',
  'js/v4/hud.js',
  'js/v4/input.js',
  'js/v4/tweak-ui.js',
  'js/v4/renderer.js',
  'js/v4/track.js',
  'js/v4/traffic.js'
];

const v4ScriptOrder = [
  'stats.js',
  'common.js',
  'js/v4/core/state.js',
  'js/v4/content/config.js',
  'js/v4/content/assets.js',
  'js/v4/content/background-map.js',
  'js/v4/content/sprite-map.js',
  'js/v4/integrations/platform.js',
  'js/v4/integrations/ads.js',
  'js/v4/integrations/analytics.js',
  'js/v4/systems/save.js',
  'js/v4/core/app.js',
  'js/v4/ui/hud.js',
  'js/v4/gameplay/track.js',
  'js/v4/gameplay/traffic.js',
  'js/v4/rendering/renderer.js',
  'js/v4/ui/input.js',
  'js/v4/ui/tweak-ui.js',
  'js/v4/core/game.js'
];

for (const file of requiredFiles)
  checkFile(file);

for (const dir of requiredDirs)
  checkDir(dir);

for (const file of removedRuntimeFiles) {
  if (fs.existsSync(path.join(root, file))) {
    console.error(`Old runtime file should be removed: ${file}`);
    failures += 1;
  }
}

checkScriptOrder('v4.final.html', v4ScriptOrder);
checkContains('common.js', 'typeof asset ==');
checkContains('js/v4/content/config.js', "activePack: 'legacy'");
checkContains('js/v4/content/assets.js', 'assets/packs/default/images/background.png');
checkContains('js/v4/core/app.js', 'Racer.App = App');
checkContains('js/v4/content/background-map.js', 'Racer.BackgroundMap = BackgroundMap');
checkContains('js/v4/content/sprite-map.js', 'Racer.SpriteMap = SpriteMap');

if (failures > 0) {
  console.error(`\nStructure validation failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('V4 structure validation passed.');
