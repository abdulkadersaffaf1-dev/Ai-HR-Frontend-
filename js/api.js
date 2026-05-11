/**
 * api.js — thin wrapper around the FastAPI backend
 * Change API_BASE if you deploy the backend elsewhere.
 */

const API_BASE = 'http://localhost:8000';

const api = {

  async get(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },

  async postForm(path, formData) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },

  // ── Endpoints ──────────────────────────────────────────────────────────

  getStats() {
    return this.get('/stats');
  },

  getJobs() {
    return this.get('/jobs');
  },

  getCategories() {
    return this.get('/categories');
  },

  evaluate(resumeId, jobTitle) {
    const fd = new FormData();
    fd.append('resume_id', resumeId);
    fd.append('job_title', jobTitle);
    return this.postForm('/evaluate', fd);
  },

  leaderboard(jobTitle, topN) {
    const params = new URLSearchParams({ job_title: jobTitle, top_n: topN });
    return this.get('/leaderboard?' + params.toString());
  },

  upload(file, jobTitle) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('job_title', jobTitle);
    return this.postForm('/upload', fd);
  },
};
