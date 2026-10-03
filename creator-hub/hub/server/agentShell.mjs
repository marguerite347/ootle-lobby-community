export const AGENT_GUIDE_PATH = '/agent-start.md';
export const AGENT_GUIDE_HTML_PATH = '/agent-start';
export const AGENT_GUIDE_LABEL = 'Build with an agent';

const chromeStyle = `<style>
.agent-guide-link{position:fixed;top:10px;left:10px;transform:translateY(-160%);z-index:100;background:#17101f;color:#d5f544;font-family:Poppins,sans-serif;padding:12px 14px;border-radius:8px;font-size:13px;text-decoration:none}
.agent-guide-link:focus{transform:none}
</style>`;
const chromeLink = `<a class="agent-guide-link" href="${AGENT_GUIDE_HTML_PATH}">${AGENT_GUIDE_LABEL}</a>`;
const bareParagraph = /<p>\s*<a href="\/agent-start(?:\.md)?">Build with an agent<\/a>\s*<\/p>\s*/g;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function headingSlug(text) {
  return text.toLowerCase().replace(/[`*_]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function browserHref(href) {
  if (href === AGENT_GUIDE_PATH || href.startsWith(`${AGENT_GUIDE_PATH}#`)) {
    return href.replace(AGENT_GUIDE_PATH, AGENT_GUIDE_HTML_PATH);
  }
  return href;
}

function inlineMarkup(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${escapeHtml(browserHref(href))}">${label}</a>`);
}

function guideBlocks(markdown) {
  return String(markdown).split('```').map((part, index) => {
    if (index % 2 === 1) {
      const newline = part.indexOf('\n');
      const code = newline === -1 ? part : part.slice(newline + 1);
      return `<pre><code>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`;
    }
    return part.split(/\n{2,}/).map((block) => {
      const lines = block.split('\n').filter((line) => line.length > 0);
      if (/^(?:\d+\.|[-*])\s+/.test(lines[0] || '')) {
        for (let i = lines.length - 1; i > 0; i -= 1) {
          if (!/^(?:\d+\.|[-*])\s+/.test(lines[i]) && /^\s+/.test(lines[i])) {
            lines[i - 1] += ' ' + lines[i].trim();
            lines.splice(i, 1);
          }
        }
      }
      if (!lines.length) return '';
      const heading = lines.length === 1 ? lines[0].match(/^(#{1,4})\s+(.+)$/) : null;
      if (heading) {
        const level = heading[1].length;
        return `<h${level} id="${headingSlug(heading[2])}">${inlineMarkup(heading[2])}</h${level}>`;
      }
      if (lines.every((line) => line.startsWith('|'))) {
        const rows = lines.map(line => line.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
        const data = rows.filter(row => !row.every(cell => /^:?-{3,}:?$/.test(cell)));
        return `<div class="guide-table"><table><thead><tr>${data[0].map(cell => `<th scope="col">${inlineMarkup(cell)}</th>`).join('')}</tr></thead><tbody>${data.slice(1).map(row => `<tr>${row.map(cell => `<td>${inlineMarkup(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
      if (lines.every(line => /^\d+\.\s+/.test(line))) {
        return `<ol>${lines.map(line => `<li>${inlineMarkup(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
      }
      if (lines.every((line) => /^[-*]\s+/.test(line))) {
        return `<ul>${lines.map((line) => `<li>${inlineMarkup(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.map(inlineMarkup).join('<br>')}</p>`;
    }).join('\n');
  }).join('\n');
}

export function agentGuideHtml(markdown) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${AGENT_GUIDE_LABEL}</title>
    <style>
      body{margin:0;background:#0b0c12;color:#d9d3e5;font-family:Poppins,sans-serif;line-height:1.5}
      main{max-width:760px;margin:0 auto;padding:32px 20px 80px}
      a{color:#d5f544}
      pre{overflow:auto;background:#17101f;padding:14px;border-radius:8px}
      code{font-family:ui-monospace,monospace;overflow-wrap:anywhere}
      .guide-table{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.94rem}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #b99aff33;min-width:120px}th{color:#e6ff86}a{overflow-wrap:anywhere}li{margin:.6em 0}h2{margin-top:2.5em}h3{margin-top:1.8em}
    </style>
  </head>
  <body>
    <main>
      <p><a href="/">Ootle Lobby</a></p>
      ${guideBlocks(markdown)}
    </main>
  </body>
</html>`;
}

export function withAgentGuideLink(html) {
  let next = html.replace(bareParagraph, '');
  next = next.replace(/class="agent-guide-link" href="\/agent-start\.md"/g, `class="agent-guide-link" href="${AGENT_GUIDE_HTML_PATH}"`);
  if (!next.includes('class="agent-guide-link"')) {
    if (next.includes('<div id="root"></div>')) {
      next = next.replace('<div id="root"></div>', `${chromeLink}\n    <div id="root"></div>`);
    } else if (next.includes('<body>')) {
      next = next.replace('<body>', `<body>\n    ${chromeLink}`);
    } else {
      next = `${chromeLink}\n${next}`;
    }
  }
  if (!next.includes('.agent-guide-link{')) {
    next = next.includes('</head>')
      ? next.replace('</head>', `    ${chromeStyle}\n  </head>`)
      : `${chromeStyle}\n${next}`;
  }
  return next;
}

export function agentGuideFallbackHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Ootle Lobby</title>
    <style>
      body{margin:0;background:#0b0c12;color:#d9d3e5;font-family:Poppins,sans-serif}
      .agent-guide-bar{display:flex;align-items:center;margin:0;padding:14px 22px;background:#17101f;border-bottom:1px solid #ffffff14}
      .agent-guide-bar a{color:#d5f544;font-size:13px;text-decoration:none}
    </style>
  </head>
  <body>
    <p class="agent-guide-bar"><a href="${AGENT_GUIDE_HTML_PATH}">${AGENT_GUIDE_LABEL}</a></p>
    <p>Ootle Lobby API is running. Build the client with npm run build.</p>
  </body>
</html>`;
}
