// src/components/MyTeam.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/Myteam.css'; // Ensure the correct CSS file is imported
import Navbar from '../components/Navbar';
import { useUser } from '../context/UserContext';

const MyTeam = () => {
    const { user } = useUser();
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        if (user) {
            const storedTeams = localStorage.getItem('joinedTeams');
            if (storedTeams) {
                setTeams(JSON.parse(storedTeams));
            } else {
                fetchTeams();
            }
        }
    }, [user]);

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/code-editor/teams/user/${user.username}`);
            setTeams(response.data);
            localStorage.setItem('joinedTeams', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleExit = async (teamId) => {
        try {
            await axios.post(`http://localhost:3000/code-editor/teams/${teamId}/exit`, { username: user.username });

            // Remove the exited team from the state and local storage
            setTeams(prevTeams => {
                const updatedTeams = prevTeams.filter(team => team.teamId !== teamId);
                localStorage.setItem('joinedTeams', JSON.stringify(updatedTeams));
                return updatedTeams;
            });
        } catch (error) {
            console.error('Error exiting team:', error);
        }
    };

    return (
        <div className="teams-container">
            <Navbar />
            <div className="section teams-list">
                <h2>My Teams</h2>
                {teams.length === 0 ? (
                    <p>You have not joined any teams yet.</p>
                ) : (
                    <div className="teams-grid">
                        {teams.map(team => (
                            <div key={team.teamId} className="teams">
                                <h3>{team.teamName}</h3>
                                <button onClick={() => handleExit(team.teamId)}>Exit Team</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTeam;
