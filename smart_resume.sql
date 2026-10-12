CREATE DATABASE smart_resume;
USE smart_resume;

-- 1. Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    objective TEXT
);

-- 2. Skills Table
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- 3. Roles Table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL
);

-- 4. UserSkills Junction Table (Composite PK prevents duplicates)
CREATE TABLE UserSkills (
    user_id INT,
    skill_id INT,
    proficiency VARCHAR(50),
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- 5. RoleSkills Junction Table (Composite PK prevents duplicates)
CREATE TABLE RoleSkills (
    role_id INT,
    skill_id INT,
    PRIMARY KEY (role_id, skill_id),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- 6. Education Table
CREATE TABLE Education (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    degree VARCHAR(100) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    score VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 7. Projects Table
CREATE TABLE Projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    technologies VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Seed Skills across Categories
INSERT INTO Skills (skill_name, category) VALUES
('HTML', 'Web Technologies'),
('CSS', 'Web Technologies'),
('JavaScript', 'Web Technologies'),
('React', 'Frameworks'),
('Node.js', 'Frameworks'),
('Python', 'Programming Languages'),
('Django', 'Frameworks'),
('Flask', 'Frameworks'),
('Java', 'Programming Languages'),
('Spring Boot', 'Frameworks'),
('SQL', 'Databases'),
('Excel', 'Tools'),
('Power BI', 'Tools'),
('Git', 'Tools');

-- Seed Target Roles
INSERT INTO Roles (role_name) VALUES
('Full Stack Developer'),
('Python Developer'),
('Data Analyst'),
('Java Developer');
SELECT * FROM Skills;
SELECT * FROM Roles;
-- Full Stack Developer (HTML, CSS, JavaScript, React, Node.js, SQL)
INSERT INTO RoleSkills (role_id, skill_id)
SELECT r.role_id, s.skill_id 
FROM Roles r, Skills s 
WHERE r.role_name = 'Full Stack Developer' 
  AND s.skill_name IN ('HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL');

-- Python Developer (Python, Django, Flask, SQL)
INSERT INTO RoleSkills (role_id, skill_id)
SELECT r.role_id, s.skill_id 
FROM Roles r, Skills s 
WHERE r.role_name = 'Python Developer' 
  AND s.skill_name IN ('Python', 'Django', 'Flask', 'SQL');

-- Data Analyst (Python, SQL, Excel, Power BI)
INSERT INTO RoleSkills (role_id, skill_id)
SELECT r.role_id, s.skill_id 
FROM Roles r, Skills s 
WHERE r.role_name = 'Data Analyst' 
  AND s.skill_name IN ('Python', 'SQL', 'Excel', 'Power BI');

-- Java Developer (Java, Spring Boot, SQL, Git)
INSERT INTO RoleSkills (role_id, skill_id)
SELECT r.role_id, s.skill_id 
FROM Roles r, Skills s 
WHERE r.role_name = 'Java Developer' 
  AND s.skill_name IN ('Java', 'Spring Boot', 'SQL', 'Git');
-- Verification: Run the query below to check if mappings are properly populated:SQL
SELECT r.role_name, s.skill_name 
FROM RoleSkills rs
JOIN Roles r ON rs.role_id = r.role_id
JOIN Skills s ON rs.skill_id = s.skill_id;