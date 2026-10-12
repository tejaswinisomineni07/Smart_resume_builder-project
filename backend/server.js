const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Create or Save User Profile
app.post('/api/users', async (req, res) => {
  const { name, email, phone, objective } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Users (name, email, phone, objective) VALUES (?, ?, ?, ?)',
      [name, email, phone, objective]
    );
    res.status(201).json({ userId: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Fetch Complete User Profile
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [[user]] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [education] = await db.query('SELECT * FROM Education WHERE user_id = ?', [userId]);
    const [projects] = await db.query('SELECT * FROM Projects WHERE user_id = ?', [userId]);
    const [skills] = await db.query(
      `SELECT s.skill_id, s.skill_name, s.category, us.proficiency 
       FROM UserSkills us 
       JOIN Skills s ON us.skill_id = s.skill_id 
       WHERE us.user_id = ?`,
      [userId]
    );

    res.json({ ...user, education, projects, skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add Education Entry
app.post('/api/users/:id/education', async (req, res) => {
  const userId = req.params.id;
  const { degree, institution, year, score } = req.body;
  try {
    await db.query(
      'INSERT INTO Education (user_id, degree, institution, year, score) VALUES (?, ?, ?, ?, ?)',
      [userId, degree, institution, year, score]
    );
    res.status(201).json({ message: 'Education record added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Add Project Entry
app.post('/api/users/:id/projects', async (req, res) => {
  const userId = req.params.id;
  const { title, description, technologies } = req.body;
  try {
    await db.query(
      'INSERT INTO Projects (user_id, title, description, technologies) VALUES (?, ?, ?, ?)',
      [userId, title, description, technologies]
    );
    res.status(201).json({ message: 'Project record added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Add User Skills
app.post('/api/users/:id/skills', async (req, res) => {
  const userId = req.params.id;
  const { skillIds } = req.body; // Array of skill_ids, e.g., [1, 2, 5]
  try {
    for (let skillId of skillIds) {
      await db.query(
        'INSERT IGNORE INTO UserSkills (user_id, skill_id) VALUES (?, ?)',
        [userId, skillId]
      );
    }
    res.json({ message: 'Skills associated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Get Roles List
app.get('/api/roles', async (req, res) => {
  try {
    const [roles] = await db.query('SELECT * FROM Roles');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get All Master Skills (For Selection)
app.get('/api/skills', async (req, res) => {
  try {
    const [skills] = await db.query('SELECT * FROM Skills');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Recommendation Logic: Compare User Skills vs Role Skills
app.get('/api/recommendations/:userId/:roleId', async (req, res) => {
  const { userId, roleId } = req.params;
  try {
    // Get user skills
    const [userSkills] = await db.query(
      'SELECT skill_id FROM UserSkills WHERE user_id = ?',
      [userId]
    );
    const userSkillIds = new Set(userSkills.map(s => s.skill_id));

    // Get role skills
    const [roleSkills] = await db.query(
      `SELECT s.skill_id, s.skill_name 
       FROM RoleSkills rs 
       JOIN Skills s ON rs.skill_id = s.skill_id 
       WHERE rs.role_id = ?`,
      [roleId]
    );

    const matchedSkills = [];
    const missingSkills = [];

    roleSkills.forEach(skill => {
      if (userSkillIds.has(skill.skill_id)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    res.json({ matchedSkills, missingSkills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});