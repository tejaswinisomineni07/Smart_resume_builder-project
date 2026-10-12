const API_URL = 'http://localhost:5000/api';
let currentUserId = null;

// Initialize Options
document.addEventListener('DOMContentLoaded', async () => {
  // Load Roles
  const rolesRes = await fetch(`${API_URL}/roles`);
  const roles = await rolesRes.json();
  const roleSelect = document.getElementById('roleSelect');
  roles.forEach(r => {
    roleSelect.innerHTML += `<option value="${r.role_id}">${r.role_name}</option>`;
  });

  // Load Skills
  const skillsRes = await fetch(`${API_URL}/skills`);
  const skills = await skillsRes.json();
  const skillsList = document.getElementById('skillsList');
  skills.forEach(s => {
    skillsList.innerHTML += `
      <label><input type="checkbox" value="${s.skill_id}" class="skill-cb"> ${s.skill_name}</label>
    `;
  });
});

// Step 1: Create Profile
document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    objective: document.getElementById('objective').value
  };

  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.userId) {
    currentUserId = data.userId;
    alert('User created successfully!');
    document.getElementById('detailsSection').classList.remove('disabled');
    document.getElementById('skillsSection').classList.remove('disabled');
    document.getElementById('analysisSection').classList.remove('disabled');
    document.getElementById('previewSection').classList.remove('disabled');
    updatePreview();
  }
});

// Step 2A: Add Education
document.getElementById('eduForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    degree: document.getElementById('degree').value,
    institution: document.getElementById('institution').value,
    year: document.getElementById('year').value,
    score: document.getElementById('score').value
  };
  await fetch(`${API_URL}/users/${currentUserId}/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  alert('Education Added');
  document.getElementById('eduForm').reset();
  updatePreview();
});

// Step 2B: Add Project
document.getElementById('projForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('projTitle').value,
    description: document.getElementById('projDesc').value,
    technologies: document.getElementById('projTech').value
  };
  await fetch(`${API_URL}/users/${currentUserId}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  alert('Project Added');
  document.getElementById('projForm').reset();
  updatePreview();
});

// Step 3: Save Skills
document.getElementById('saveSkillsBtn').addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('.skill-cb:checked')).map(cb => parseInt(cb.value));
  await fetch(`${API_URL}/users/${currentUserId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillIds: selected })
  });
  alert('Skills Saved');
  updatePreview();
});

// Step 4: Analyze Skill Gap
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const roleId = document.getElementById('roleSelect').value;
  if (!roleId) return alert('Select a role first!');
  
  const res = await fetch(`${API_URL}/recommendations/${currentUserId}/${roleId}`);
  const data = await res.json();

  const matchedDiv = document.getElementById('matchedSkills');
  const missingDiv = document.getElementById('missingSkills');
  matchedDiv.innerHTML = '';
  missingDiv.innerHTML = '';

  data.matchedSkills.forEach(s => {
    matchedDiv.innerHTML += `<span class="badge badge-green">${s.skill_name}</span>`;
  });

  data.missingSkills.forEach(s => {
    missingDiv.innerHTML += `<span class="badge badge-red">${s.skill_name}</span>`;
  });
});

// Step 5: Update Live Preview
async function updatePreview() {
  if (!currentUserId) return;
  const res = await fetch(`${API_URL}/users/${currentUserId}`);
  const user = await res.json();

  document.getElementById('prevName').innerText = user.name || 'Your Name';
  document.getElementById('prevContact').innerText = `${user.email || ''} | ${user.phone || ''}`;
  document.getElementById('prevObjective').innerText = user.objective || '';

  const eduUl = document.getElementById('prevEducation');
  eduUl.innerHTML = user.education.map(e => `<li><b>${e.degree}</b> - ${e.institution} (${e.year})</li>`).join('');

  const projUl = document.getElementById('prevProjects');
  projUl.innerHTML = user.projects.map(p => `<li><b>${p.title}</b>: ${p.description} <i>[${p.technologies}]</i></li>`).join('');

  document.getElementById('prevSkills').innerText = user.skills.map(s => s.skill_name).join(', ');
}