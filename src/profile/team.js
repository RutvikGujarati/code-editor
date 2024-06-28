// src/components/Team.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/Team.css';
import Navbar from '../components/Navbar';

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3000/code-editor/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const username = localStorage.getItem('username'); // Assuming you store the username in localStorage on login
      await axios.post('http://localhost:3000/code-editor/teams', { teamName, owner: username });
      setTeamName('');
      fetchTeams(); // Refresh the team list
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      const username = localStorage.getItem('username');
      await axios.post('http://localhost:3000/code-editor/teams/join', { teamId, username });
      alert('Request to join team sent');
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  return (
    <div className="teams-container">
      <div className='box1'>
        <div className="section team-list">
          <Navbar />
          <h2>Join a Team</h2>
          {teams.map(team => (
            <div key={team.id} className="team">
              <h3>{team.teamName}</h3>
              <button onClick={() => handleJoinTeam(team.id)}>Join Team</button>
            </div>
          ))}
        </div>
      </div>
      <div className='box2'>
        <div className="section create-teams ">
          <h2>Create a New Team</h2>
          <form onSubmit={handleCreateTeam}>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
              required
            />
            <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Team'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Team;
