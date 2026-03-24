import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GITHUB_API = 'https://api.github.com';

async function githubRequest(path, options = {}, tokenOverride) {
  const token = tokenOverride || Deno.env.get('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const url = `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status} ${res.statusText}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

function uniq(arr) { return Array.from(new Set(arr)); }

async function fetchIfOk(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const content = await res.text();
    return content;
  } catch (_) { return null; }
}

async function resolveFileFromApp(origin, basePath) {
  // Try several common extensions and the raw path (no extension)
  const candidates = [basePath, `${basePath}.jsx`, `${basePath}.js`, `${basePath}.tsx`, `${basePath}.ts`, `${basePath}.json`, `${basePath}.css`];
  for (const rel of candidates) {
    const url = `${origin}/${rel}`;
    const content = await fetchIfOk(url);
    if (content !== null) {
      return { path: rel, content };
    }
  }
  return null;
}

function parsePageNamesFromLayout(layoutText) {
  const pages = new Set();
  try {
    // 1) pageRouteMap values
    const mapMatch = layoutText.match(/const\s+pageRouteMap\s*=\s*\{([\s\S]*?)\};?/);
    if (mapMatch) {
      const body = mapMatch[1];
      const re = /:\s*"([^"]+)"/g;
      let m;
      while ((m = re.exec(body)) !== null) { pages.add(m[1]); }
    }
    // 2) navigationItems -> createPageUrl("PageName")
    const navMatches = layoutText.match(/createPageUrl\(\"([^\"]+)\"\)/g) || [];
    for (const nm of navMatches) {
      const m = nm.match(/createPageUrl\(\"([^\"]+)\"\)/);
      if (m && m[1]) pages.add(m[1]);
    }
  } catch (_) {}
  return Array.from(pages);
}

function parseImports(jsText, currentPath) {
  // Return normalized app-relative component/page paths
  // We look for imports of local files (components/... or relative ../components/... etc.)
  const results = new Set();
  const importRe = /import\s+[^'"\n]+from\s+['"]([^'\"]+)['"];?/g;
  let m;
  while ((m = importRe.exec(jsText)) !== null) {
    const spec = m[1];
    if (spec.startsWith('@/components/')) {
      results.add(`components/${spec.replace('@/components/', '')}`);
    } else if (spec.startsWith('../components/')) {
      // pages/... + ../components/... => components/...
      results.add(`components/${spec.replace('../components/', '')}`);
    } else if (spec.startsWith('./') || spec.startsWith('../')) {
      // Relative sibling in components subfolders
      if (currentPath.startsWith('components/')) {
        const parts = currentPath.split('/');
        parts.pop(); // remove file name
        const baseDir = parts.join('/');
        const normalized = normalizeRelativePath(baseDir, spec);
        if (normalized.startsWith('components/')) results.add(normalized);
      }
    } else if (spec.startsWith('components/')) {
      results.add(spec);
    }
  }
  return Array.from(results);
}

function normalizeRelativePath(baseDir, rel) {
  const stack = baseDir.split('/').filter(Boolean);
  for (const seg of rel.split('/')) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') stack.pop(); else stack.push(seg);
  }
  return stack.join('/');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Auth optional (utility endpoint)
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    const origin = new URL(req.url).origin;

    const repoInput = (payload.repo || Deno.env.get('GITHUB_REPO') || '').trim();
    const branch = (payload.branch || 'develop').trim();
    const now = new Date().toISOString().replace('T',' ').replace('Z',' UTC');
    const commitMessage = (payload.commit_message || payload.message || `Sync from Base44 • ${now}`).trim();
    const mode = (payload.mode || 'default').trim(); // 'default' | 'best_effort'

    const tokenOverride = (payload.token || '').trim() || undefined;
    const gh = (path, options) => githubRequest(path, options, tokenOverride);

    if (!repoInput || !repoInput.includes('/')) {
      return Response.json({ error: 'Invalid repo. Provide owner/repo in payload.repo or set GITHUB_REPO' }, { status: 400 });
    }
    const [owner, repo] = repoInput.split('/');

    // 1) Build files list
    let files = Array.isArray(payload.files) && payload.files.length > 0 ? payload.files : [];

    if (files.length === 0) {
      // Start with some roots
      const rootCandidates = ['layout', 'index.html', 'index.css', 'globals.css', 'tailwind.config.js'];
      for (const p of rootCandidates) {
        const found = await resolveFileFromApp(origin, p);
        if (found) files.push(found);
      }

      // Try to discover pages from Layout
      const layoutFile = files.find(f => f.path === 'layout');
      let layoutText = layoutFile?.content;
      if (!layoutText) {
        const lf = await resolveFileFromApp(origin, 'layout');
        layoutText = lf?.content || '';
        if (lf && !files.some(f => f.path === lf.path)) files.push(lf);
      }

      const pageNames = parsePageNamesFromLayout(layoutText);
      const queue = pageNames.map(n => `pages/${n}`);
      const seen = new Set(queue);

      // BFS through pages and their component imports (limit to 250 files)
      while (queue.length && files.length < 250) {
        const nextPath = queue.shift();
        const file = await resolveFileFromApp(origin, nextPath);
        if (file && !files.some(f => f.path === file.path)) {
          files.push(file);
          // Parse imports to discover components
          const imports = parseImports(file.content, nextPath);
          for (const imp of imports) {
            if (!seen.has(imp)) {
              seen.add(imp);
              queue.push(imp);
            }
          }
        }
      }

      // Best-effort: include a few known shared components if referenced by layout
      const likelyShared = [
        'components/currency/QTCPriceWidget',
        'components/app/InAppAnnouncementBar',
      ];
      for (const p of likelyShared) {
        const f = await resolveFileFromApp(origin, p);
        if (f && !files.some(x => x.path === f.path)) files.push(f);
      }
    }

    if (payload.dry_run) {
      return Response.json({ dry_run: true, total: files.length, files: files.map(f => f.path) });
    }

    // 2) Prepare Git objects
    let branchExists = true;
    let latestCommitSha = null;
    let latestTreeSha = null;

    try {
      const headRef = await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`);
      latestCommitSha = headRef.object.sha;
      const latestCommit = await gh(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
      latestTreeSha = latestCommit.tree.sha;
    } catch (e) {
      branchExists = false;
      // Try to find a base (default branch), else we'll craft an initial commit
      try {
        const repoMeta = await gh(`/repos/${owner}/${repo}`);
        const baseBranch = repoMeta.default_branch || 'main';
        const baseRef = await gh(`/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`);
        latestCommitSha = baseRef.object.sha;
        const latestCommit = await gh(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
        latestTreeSha = latestCommit.tree.sha;
      } catch (_) {
        // No base available (new/empty repo)
        latestCommitSha = null;
        latestTreeSha = null;
      }
    }

    // Create blobs for each file
    const treeItems = [];
    for (const f of files) {
      const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: f.content, encoding: 'utf-8' }),
      });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // Create tree (with or without base)
    let tree;
    if (latestTreeSha) {
      tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({ base_tree: latestTreeSha, tree: treeItems }),
      });
    } else {
      tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({ tree: treeItems }),
      });
    }

    // Create commit (initial if no parent)
    let newCommit;
    if (latestCommitSha) {
      newCommit = await gh(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({ message: commitMessage, tree: tree.sha, parents: [latestCommitSha] }),
      });
    } else {
      newCommit = await gh(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({ message: commitMessage, tree: tree.sha }),
      });
    }

    // Update or create ref
    if (branchExists) {
      await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommit.sha, force: false }),
      });
    } else {
      await gh(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommit.sha }),
      });
    }

    return Response.json({ success: true, branch, commit_sha: newCommit.sha, file_count: files.length, files: files.map(f => f.path), url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}` });
  } catch (error) {
    // Best-effort log to AppLog if available
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AppLog.create({
        type: 'integration',
        severity: 'error',
        source: 'pushToGithub',
        message: 'GitHub push failed',
        details: { error: String(error) },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ error: error.message }, { status: 500 });
  }
});