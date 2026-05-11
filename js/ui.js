/**
 * ui.js — pure rendering helpers
 * None of these functions fetch data; they only build HTML strings.
 */

// ── Shared ─────────────────────────────────────────────────────────────────

function spinner(msg = 'Processing…') {
  return `<div class="spinner-wrap"><div class="spinner"></div>${msg}</div>`;
}

function errorBox(msg) {
  return `<div class="error-box">⚠ ${msg}</div>`;
}

function verdictClass(code) {
  const map = { hire: 'verdict-hire', shortlist: 'verdict-shortlist', training: 'verdict-training', reject: 'verdict-reject' };
  return map[code] || 'verdict-reject';
}

function barColor(code) {
  const map = { hire: 'var(--hire-bar)', shortlist: 'var(--short-bar)', training: 'var(--train-bar)', reject: 'var(--reject-bar)' };
  return map[code] || 'var(--reject-bar)';
}

// ── Hiring report (used by Engine 1 and Engine 3) ──────────────────────────

function renderReport(data) {
  const vcode  = data.verdict.code;
  const vLabel = data.verdict.label;
  const score  = data.score;
  const bd     = data.score_breakdown;

  const idLine = data.resume_id
    ? `Resume ID <span style="color:var(--text-primary);font-weight:600">#${data.resume_id}</span>`
    : `File: <span style="color:var(--text-primary);font-weight:600">${data.filename || 'uploaded'}</span>`;

  const skillsMatched = (data.skills_matched || []).map(s =>
    `<span class="skill-tag matched">${s}</span>`).join('') || '<span style="color:var(--text-muted);font-size:.8rem">None detected</span>';

  const skillsMissing = (data.skills_missing || []).map(s =>
    `<span class="skill-tag missing">${s}</span>`).join('') || '<span style="color:var(--text-muted);font-size:.8rem">No gaps detected</span>';

  const courses = (data.recommended_courses || []).map(c =>
    `<span class="skill-tag course">${c}</span>`).join('') || '<span style="color:var(--text-muted);font-size:.8rem">—</span>';

  const interviewHtml = (data.interview_questions || []).map(q => `
    <div class="interview-item">
      <div class="interview-q">Q: ${q.question}</div>
      <div class="interview-g">Guideline: ${q.guideline}</div>
    </div>
  `).join('');

  const faqHtml = (data.faqs || []).map(f => `
    <div class="interview-item">
      <div class="interview-q">${f.question}</div>
      <div class="interview-g">${f.answer}</div>
    </div>
  `).join('');

  return `
    <div class="report-card">
      <div class="report-top">
        <div class="report-identity">
          <div class="report-id">${idLine}</div>
          <div class="report-role">${data.target_job}</div>
          <div class="report-cat">Candidate background: ${data.predicted_category} · Target: ${data.target_category}</div>
        </div>
        <span class="verdict-pill ${verdictClass(vcode)}">${vLabel}</span>
      </div>

      <div class="report-score-section">
        <div class="score-headline">
          <span class="score-big">${score}%</span>
          <span class="score-label-small">match score</span>
        </div>
        <div class="score-track">
          <div class="score-fill" style="width:${score}%;background:${barColor(vcode)}"></div>
        </div>
        <div class="breakdown-grid">
          <div class="breakdown-item">
            <div class="breakdown-val">${bd.semantic_similarity}%</div>
            <div class="breakdown-lbl">Semantic similarity<br><span style="color:var(--text-muted);font-size:.65rem">45% weight</span></div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-val">${bd.percentile_rank}%</div>
            <div class="breakdown-lbl">Percentile rank<br><span style="color:var(--text-muted);font-size:.65rem">35% weight</span></div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-val">${bd.skill_coverage}%</div>
            <div class="breakdown-lbl">Skill coverage<br><span style="color:var(--text-muted);font-size:.65rem">15% weight</span></div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-val">${bd.category_fit}%</div>
            <div class="breakdown-lbl">Category fit<br><span style="color:var(--text-muted);font-size:.65rem">5% weight</span></div>
          </div>
        </div>
      </div>

      <div class="report-body">
        <div>
          <div class="report-section-title">Skills matched</div>
          <div class="skill-tags">${skillsMatched}</div>
        </div>
        <div>
          <div class="report-section-title">Skill gaps</div>
          <div class="skill-tags">${skillsMissing}</div>
        </div>
        <div>
          <div class="report-section-title">Recommended courses</div>
          <div class="skill-tags">${courses}</div>
        </div>
        ${faqHtml ? `
        <div>
          <div class="report-section-title">Relevant FAQs</div>
          <div class="interview-list">${faqHtml}</div>
        </div>` : '<div></div>'}
        ${interviewHtml ? `
        <div class="report-full-width">
          <div class="report-section-title">Interview questions</div>
          <div class="interview-list">${interviewHtml}</div>
        </div>` : ''}
      </div>
    </div>`;
}

// ── Leaderboard ────────────────────────────────────────────────────────────

function renderLeaderboard(data) {
  const rows = data.candidates.map(c => {
    const vcode = c.verdict.code;
    const color = barColor(vcode);
    return `
      <tr>
        <td class="td-rank">${c.rank}</td>
        <td class="td-id">${c.resume_id}</td>
        <td>${c.category}</td>
        <td>
          <div class="mini-bar-wrap"><div class="mini-bar" style="width:${c.score}%;background:${color}"></div></div>
          <span class="td-score" style="color:${color}">${c.score}%</span>
        </td>
        <td>${c.semantic_sim}%</td>
        <td>${c.skill_coverage}%</td>
        <td>${c.percentile_rank}%</td>
        <td><span class="verdict-pill ${verdictClass(vcode)}" style="font-size:.68rem;padding:3px 10px">${c.verdict.label}</span></td>
      </tr>`;
  }).join('');

  return `
    <div class="report-card">
      <div class="lb-header-row">
        <div>
          <div class="lb-job-name">${data.job_title}</div>
          <div class="lb-count">${data.total_ranked.toLocaleString()} candidates ranked · showing top ${data.top_n}</div>
        </div>
      </div>
      <div class="lb-table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Resume ID</th>
              <th>Category</th>
              <th>Match score</th>
              <th>Semantic</th>
              <th>Skills</th>
              <th>Percentile</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ── Dashboard categories ───────────────────────────────────────────────────

function renderCategories(cats) {
  return cats.map(c => `<span class="category-chip">${c}</span>`).join('');
}
