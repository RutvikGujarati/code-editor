CREATE DATABASE login_signup_db;

USE login_signup_db;

CREATE TABLE users (
    id INT  PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE teams (
    id INT  PRIMARY KEY,
    teamName VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL
);

CREATE TABLE team_requests (
    id INT  PRIMARY KEY,
    teamId INT,
    username VARCHAR(255),
    FOREIGN KEY (teamId) REFERENCES teams(id)
);

CREATE TABLE team_members (
    id INT  PRIMARY KEY,
    teamId INT,
    username VARCHAR(255),
    FOREIGN KEY (teamId) REFERENCES teams(id)
);
