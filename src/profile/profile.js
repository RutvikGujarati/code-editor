// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import coder from "../assets/coder.jpeg";
import coder2 from "../assets/coder2.jpeg";
import i3 from "../assets/coder3.jpeg";
import i4 from "../assets/coder4.jpeg";
import i5 from "../assets/coder5.jpeg";
import i6 from "../assets/coder6.jpeg";
import Navbar from '../components/Navbar';

const Profile = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const loggedInUsername = localStorage.getItem('username'); // Assuming you store the username in localStorage on login
                const response = await axios.get(`http://localhost:3000/user/${loggedInUsername}`);
                setUsername(response.data.username);
                console.log("user name", response.data.username)
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    // Random images array
    const images = [
        coder,
        coder2,
        i3,
        i4,
        i5,
        i6
    ];

    // Generate a random index for images array
    const randomIndex = Math.floor(Math.random() * images.length);

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-details">
                <h2>username:  {username}</h2>
            </div>
            <div className="profile-image">
                <img src={images[randomIndex]} alt="Profile" />
            </div>
            <div >
                <h2>go to <a href='/team'>  <FontAwesomeIcon icon={faUsers} /> Team </a> Section to join or create a team to code in community.</h2>
            </div>
        </div>
    );
};

export default Profile;
