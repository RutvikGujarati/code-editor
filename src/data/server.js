const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');

const clients = new Map();


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_signup_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});


const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'join') {
                const { username, teamId } = parsedMessage;

                // Check if the user is in the team_members table
                const sql = 'SELECT * FROM team_members WHERE username = ? AND teamId = ?';
                db.query(sql, [username, teamId], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        ws.send(JSON.stringify({ type: 'error', message: 'Database error' }));
                        return;
                    }

                    if (results.length > 0) {
                        // Store the client's teamId and username if they are a valid team member
                        clients.set(ws, { username, teamId });
                        ws.send(JSON.stringify({ type: 'info', message: 'Joined the team successfully' }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'You are not a member of this team' }));
                        ws.close();
                    }
                });
            } else if (parsedMessage.type === 'code') {
                const { teamId, language, value } = parsedMessage;

                // Broadcast to team members only
                wss.clients.forEach(client => {
                    const clientInfo = clients.get(client);
                    if (clientInfo && clientInfo.teamId === teamId && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'code', language, value }));
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            res.status(500).send('Error registering user');
            console.error(err);
            return;
        }
        res.send('User registered');
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error during login');
            console.error(err);
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            const passwordIsValid = bcrypt.compareSync(password, user.password);

            if (passwordIsValid) {
                res.send({ message: 'Login successful', username: user.username });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.get('/user/:username', (req, res) => {
    const { username } = req.params;
    const sql = 'SELECT username FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching user data');
            console.error(err);
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            res.send({ username: user.username });
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.get('/code-editor/user/team', (req, res) => {
    const username = req.user.username;
  
    db.query(
      'SELECT teamId FROM team_members WHERE username = ?',
      [username],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: 'Database query failed' });
        }
  
        if (results.length > 0) {
          res.json({ teamId: results[0].teamId });
        } else {
          res.status(404).json({ error: 'Team not found for user' });
        }
      }
    );
  });

// Fetch all teams
app.get('/code-editor/teams', (req, res) => {
    const sql = 'SELECT * FROM teams';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching teams');
            console.error(err);
            return;
        }
        res.send(results);
    });
});

// Create a new team
app.post('/code-editor/teams', (req, res) => {
    const { teamName, owner } = req.body;
    const sql = 'INSERT INTO teams (teamName, owner) VALUES (?, ?)';
    db.query(sql, [teamName, owner], (err, results) => {
        if (err) {
            res.status(500).send('Error creating team');
            console.error(err);
            return;
        }
        res.send({ message: 'Team created successfully' });
    });
});

// Request to join a team
app.post('/code-editor/teams/join', (req, res) => {
    const { teamId, username } = req.body;
    const sql = 'INSERT INTO team_requests (teamId, username) VALUES (?, ?)';
    db.query(sql, [teamId, username], (err, results) => {
        if (err) {
            console.error('Error requesting to join team:', err);
            return res.status(500).send('Error requesting to join team');
        }
        res.send({ message: 'Request to join team sent' });
    });
});

// Fetch join requests for a team and approve a join request
// Fetch all join requests
app.get('/code-editor/teams/join-requests', (req, res) => {
    const sql = 'SELECT * FROM team_requests';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching join requests:', err);
            return res.status(500).send('Error fetching join requests');
        }
        res.send(results);
    });
});

// Delete a join request
// Add a member to a team and delete the join request
app.post('/code-editor/teams/join-requests/approve', (req, res) => {
    const { teamId, username, requestId } = req.body;

    const sqlAddMember = 'INSERT INTO team_members (teamId, username) VALUES (?, ?)';
    const sqlDeleteRequest = 'DELETE FROM team_requests WHERE id = ?';

    db.query(sqlAddMember, [teamId, username], (err) => {
        if (err) {
            res.status(500).send('Error adding member to the team');
            console.error(err);
            return;
        }

        db.query(sqlDeleteRequest, [requestId], (err) => {
            if (err) {
                res.status(500).send('Error deleting join request');
                console.error(err);
                return;
            }

            res.send({ message: 'Member added to the team and join request deleted' });
        });
    });
});


// Fetch teams the user has joined
app.get('/code-editor/teams/user/:username', (req, res) => {
    const { username } = req.params;

    const sql = `
        SELECT tm.teamId, t.teamName, t.owner 
        FROM team_members tm 
        JOIN teams t ON tm.teamId = t.id 
        WHERE tm.username = ?`;

    db.query(sql, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching teams');
            console.error(err);
            return;
        }
        res.send(results);
    });
});

app.get('/api/user/:username/team-ids', (req, res) => {
    const { username } = req.params;
  
    const sql = `
        SELECT teamId 
        FROM team_members 
        WHERE username = ?`;
  
    db.query(sql, [username], (err, results) => {
      if (err) {
        res.status(500).send('Error fetching team IDs');
        console.error(err);
        return;
      }
      res.send(results.map(result => result.teamId));
    });
  });
// Fetch teams the user has joined
app.get('/code-editor/teams/join', (req, res) => {
    const { username } = req;

    const sql = `
        SELECT tm.teamId, t.teamName, t.owner 
        FROM team_members tm 
        JOIN teams t ON tm.teamId = t.id 
        WHERE tm.username = ?`;

    db.query(sql, [username], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching teams');
            console.error(err);
            return;
        }
        res.send(results);
    });
});


// Exit a team
app.post('/code-editor/teams/:teamId/exit', (req, res) => {
    const { teamId } = req.params;
    const { username } = req.body;

    const sqlExitTeam = 'DELETE FROM team_members WHERE teamId = ? AND username = ?';

    db.query(sqlExitTeam, [teamId, username], (err) => {
        if (err) {
            res.status(500).send('Error exiting team');
            console.error(err);
            return;
        }

        res.send({ message: 'Exited team successfully' });
    });
});


app.post('/code-editor/teams/:teamId/join-requests/approve', (req, res) => {
    const { teamId } = req.params;
    const { requestId, username } = req.body;

    const sqlApprove = 'INSERT INTO team_members (teamId, username) VALUES (?, ?)';
    const sqlDeleteRequest = 'DELETE FROM team_requests WHERE id = ?';

    db.query(sqlApprove, [teamId, username], (err) => {
        if (err) {
            console.error('Error approving request:', err);
            return res.status(500).send('Error approving request');
        }

        db.query(sqlDeleteRequest, [requestId], (err) => {
            if (err) {
                console.error('Error deleting join request:', err);
                return res.status(500).send('Error deleting join request');
            }

            res.send({ message: 'Request approved' });
        });
    });
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'), err => {
        if (err) {
            res.status(500).send(err);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
