import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

function getCommentBlock(fn) {
  const s = fn.toString();
  const start = s.indexOf('/*');
  const end = s.lastIndexOf('*/');
  if (start === -1 || end === -1) return '';
  return s.slice(start + 2, end);
}

// Embedded file contents (exact snapshot at time of deployment)
const layoutContent = getCommentBlock(function(){/*
*/});

const walletBtnContent = getCommentBlock(function(){/*
*/});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Auth optional for this utility
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    // Inputs (payload overrides env defaults)
    const repoInput = (payload.repo || Deno.env.get('GITHUB_REPO') || '').trim();
    const branch = (payload.branch || 'develop').trim();
    const commitMessage = (payload.message || 'feat: wallet + market data + charts').trim();

    const tokenOverride = (payload.token || '').trim() || undefined;
    const gh = (path, options) => githubRequest(path, options, tokenOverride);

    if (!repoInput || !repoInput.includes('/')) {
      return Response.json({ error: 'Invalid repo. Provide owner/repo in payload.repo or set GITHUB_REPO' }, { status: 400 });
    }

    const [owner, repo] = repoInput.split('/');
    if (!owner || !repo) {
      return Response.json({ error: 'GITHUB_REPO must be in owner/repo format' }, { status: 400 });
    }

    // Files to push: either provided in payload.files [{path, content}], or default to recent changes
    let files = Array.isArray(payload.files) && payload.files.length > 0
      ? payload.files
      : [
          { path: 'layout', content: layoutContent || (await (await fetch(`${new URL(req.url).origin}/layout`)).text()) },
          { path: 'components/wallet/WalletConnectButton.jsx', content: walletBtnContent || (await (await fetch(`${new URL(req.url).origin}/components/wallet/WalletConnectButton.jsx`)).text()) },
        ];

    // Ensure target branch exists
    let headRef;
    try {
      headRef = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    } catch (e) {
      // create from main
      const mainRef = await gh(`/repos/${owner}/${repo}/git/ref/heads/main`);
      await gh(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainRef.object.sha }),
      });
      headRef = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    }

    const latestCommitSha = headRef.object.sha;
    const latestCommit = await gh(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);

    // Create blobs
    const blobShas = [];
    for (const f of files) {
      const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: f.content, encoding: 'utf-8' }),
      });
      blobShas.push({ path: f.path, sha: blob.sha });
    }

    // Create tree from base
    const tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: latestCommit.tree.sha,
        tree: blobShas.map(({ path, sha }) => ({ path, mode: '100644', type: 'blob', sha })),
      }),
    });

    // Create commit
    const newCommit = await gh(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message: commitMessage, tree: tree.sha, parents: [latestCommitSha] }),
    });

    // Update ref to point to new commit
    await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    return Response.json({ success: true, branch, commit_sha: newCommit.sha, files: files.map(f => f.path), url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});