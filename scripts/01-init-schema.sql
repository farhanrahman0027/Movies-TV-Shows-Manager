-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('Movie', 'TV Show') NOT NULL,
  director VARCHAR(255) NOT NULL,
  budget VARCHAR(100),
  location VARCHAR(255),
  duration VARCHAR(100),
  year_time VARCHAR(100),
  poster_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Insert sample users (passwords are hashed with bcryptjs)
-- User 1: email: demo@example.com, password: demo123
INSERT INTO users (email, password) VALUES
('demo@example.com', '$2a$10$YourHashedPasswordHere');

-- Insert sample movies for demo user
INSERT INTO movies (user_id, title, type, director, budget, location, duration, year_time) VALUES
(1, 'Inception', 'Movie', 'Christopher Nolan', '$160M', 'LA, Paris', '148 min', '2010'),
(1, 'Breaking Bad', 'TV Show', 'Vince Gilligan', '$3M/ep', 'Albuquerque', '49 min/ep', '2008-2013'),
(1, 'The Dark Knight', 'Movie', 'Christopher Nolan', '$185M', 'Chicago, Hong Kong', '152 min', '2008'),
(1, 'Stranger Things', 'TV Show', 'Duffer Brothers', '$8M/ep', 'Atlanta', '50 min/ep', '2016-2024');
