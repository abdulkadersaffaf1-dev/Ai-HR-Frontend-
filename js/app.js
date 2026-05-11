/**
 * app.js — navigation + event handlers
 * Wires the UI to the API layer.
 */

// ── Navigation ─────────────────────────────────────────────────────────────

function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const link = document.querySelector(`[data-page="${pageId}"]`);
  if (link) link.classList.add('active');
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goTo(link.dataset.page);
  });
});

// ── Dashboard — load stats + categories ───────────────────────────────────

async function loadStats() {
  try {
    const data = await api.getStats();
    document.getElementById('stat-resumes').textContent    = data.total_resumes.toLocaleString();
    document.getElementById('stat-categories').textContent = data.total_categories;
    document.getElementById('stat-jobs').textContent       = data.total_jobs.toLocaleString();
    document.getElementById('stat-courses').textContent    = data.total_courses.toLocaleString();

    const catEl = document.getElementById('category-list');
    catEl.innerHTML = renderCategories(data.categories);
  } catch (err) {
    document.getElementById('stat-resumes').textContent = 'err';
    console.error('Stats error:', err);
  }
}

// Pre-fill job title datalists
async function loadJobTitles() {
  try {
    const data = await api.getJobs();
    const dl   = document.getElementById('job-titles-list');
    dl.innerHTML = data.titles.map(t => `<option value="${t}">`).join('');
  } catch (err) {
    console.warn('Could not load job titles:', err);
  }
}

// ── Engine 1 — Evaluate ────────────────────────────────────────────────────

async function runEvaluate() {
  const resumeId = document.getElementById('eval-resume-id').value.trim();
  const jobTitle = document.getElementById('eval-job-title').value.trim();
  const resultEl = document.getElementById('eval-result');
  const btn      = document.getElementById('btn-evaluate');

  if (!resumeId || !jobTitle) {
    resultEl.innerHTML = errorBox('Please fill in both Resume ID and Job title.');
    return;
  }

  btn.disabled     = true;
  resultEl.innerHTML = spinner('Evaluating candidate…');

  try {
    const data = await api.evaluate(parseInt(resumeId), jobTitle);
    resultEl.innerHTML = renderReport(data);
  } catch (err) {
    resultEl.innerHTML = errorBox(err.message);
  } finally {
    btn.disabled = false;
  }
}

// ── Engine 2 — Leaderboard ─────────────────────────────────────────────────

async function runLeaderboard() {
  const jobTitle = document.getElementById('lb-job-title').value.trim();
  const topN     = parseInt(document.getElementById('lb-top-n').value) || 10;
  const resultEl = document.getElementById('lb-result');
  const btn      = document.getElementById('btn-leaderboard');

  if (!jobTitle) {
    resultEl.innerHTML = errorBox('Please enter a job title.');
    return;
  }

  btn.disabled       = true;
  resultEl.innerHTML = spinner('Ranking all candidates — this takes ~30 seconds for the full pool…');

  try {
    const data = await api.leaderboard(jobTitle, topN);
    resultEl.innerHTML = renderLeaderboard(data);
  } catch (err) {
    resultEl.innerHTML = errorBox(err.message);
  } finally {
    btn.disabled = false;
  }
}

// ── Engine 3 — Upload ──────────────────────────────────────────────────────

let selectedFile = null;

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  selectedFile = file;
  const nameEl = document.getElementById('upload-file-name');
  nameEl.style.display = 'block';
  nameEl.textContent   = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
}

// Drag-and-drop support
const uploadZone = document.getElementById('upload-zone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      selectedFile = file;
      const nameEl = document.getElementById('upload-file-name');
      nameEl.style.display = 'block';
      nameEl.textContent   = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }
  });
  uploadZone.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') {
      document.getElementById('upload-file').click();
    }
  });
}

async function runUpload() {
  const jobTitle = document.getElementById('up-job-title').value.trim();
  const resultEl = document.getElementById('upload-result');
  const btn      = document.getElementById('btn-upload');

  if (!selectedFile) {
    resultEl.innerHTML = errorBox('Please select a resume file first.');
    return;
  }
  if (!jobTitle) {
    resultEl.innerHTML = errorBox('Please enter a job title.');
    return;
  }

  btn.disabled       = true;
  resultEl.innerHTML = spinner('Extracting and evaluating resume…');

  try {
    const data = await api.upload(selectedFile, jobTitle);
    resultEl.innerHTML = renderReport(data);
  } catch (err) {
    resultEl.innerHTML = errorBox(err.message);
  } finally {
    btn.disabled = false;
  }
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement.closest('#page-evaluate')) {
    runEvaluate();
  }
  if (e.key === 'Enter' && document.activeElement.closest('#page-leaderboard')) {
    runLeaderboard();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────

(async () => {
  await Promise.all([loadStats(), loadJobTitles()]);
})();
