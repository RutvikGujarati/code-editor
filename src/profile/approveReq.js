// src/components/ApprovalRequests.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/approve.css';
import Navbar from '../components/Navbar';

const ApprovalRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('http://localhost:3000/code-editor/teams/join-requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching join requests:', error);
        }
    };
    const handleApprove = async (requestId, teamId, username) => {
        try {
            // Send a request to the backend to add the member and delete the join request
            await axios.post('http://localhost:3000/code-editor/teams/join-requests/approve', { requestId, teamId, username });
    
            // Update the state to remove the approved request from the list
            setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
    
            // Fetch the updated list of teams the user has joined
            const response = await axios.get(`http://localhost:3000/code-editor/teams/user/${username}`);
            const joinedTeams = response.data;
    
            // Save the updated list of joined teams in local storage
            localStorage.setItem('joinedTeams', JSON.stringify(joinedTeams));
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };
    
    return (
        <div className="approval-container">
            <Navbar />
            <div className="section">
                <h2>Join Requests</h2>
                {requests.length === 0 ? (
                    <p>No join requests at the moment.</p>
                ) : (
                    <div className="requests-grid">
                        {requests.map(request => (
                            <div key={request.id} className="request">
                                <p>{request.username} wants to join in your team.</p>
                                <button onClick={() => handleApprove(request.id, request.teamId, request.username)}>Approve</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalRequests;
