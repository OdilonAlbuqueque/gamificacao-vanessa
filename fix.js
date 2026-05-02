const fs = require('fs');
let t = fs.readFileSync('js/pages/configuracoes.js', 'utf8');

t = t.replace(/\/\/ ============================================================.*?============================================================/g, match => '\n/* ' + match.replace(/\/\//g, '') + ' */\n');
t = t.replace(/\/\/ ----.*?----/g, match => '\n/* ' + match.replace(/\/\//g, '') + ' */\n');

// Also the first one
t = t.replace('// ============================================================ // PAGE: CONFIGURAÇÕES // ============================================================', '/* PAGE: CONFIGURAÇÕES */\n');

// Known inline comments that are commenting out code
const k = [
  'Pre-fill connection fields with saved credentials',
  'Show connection status badge',
  'Inicializa máscara de moeda no campo preço',
  'Inputs de cor já têm valores via renderAppearanceTab',
  'mas garantimos sincronismo se a aba for re-renderizada',
  'Update color pickers to reflect new preset',
  'Highlight selected preset card',
  "Apply immediately (preview), but don't save yet",
  'Derive goldLight automatically from gold',
  'Re-render appearance tab',
  'Re-render',
  'Move modal to body for correct z-index',
  'Block editing own username',
  'Color math helpers',
  "sha256('123456')"
];

k.forEach(x => {
  let esc = x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match `// text` or `// text,`
  t = t.replace(new RegExp('\\/\\/ ' + esc + '.*?(?=(const|let|function|window|document|t\\.|\\}))', 'g'), match => '\n/* ' + match.replace(/\/\//g, '').trim() + ' */\n');
});

fs.writeFileSync('js/pages/configuracoes.js', t, 'utf8');
