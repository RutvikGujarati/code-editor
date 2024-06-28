import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faCode, faHome, faSignOut, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import "../style/navbar.css"

const Navbar = () => {
    return (
        <nav className='navbar'>
            <ul>
                <li>
                    <Link to="/editor">
                        <FontAwesomeIcon icon={faHome} /> Home
                    </Link>
                </li>
                <li>
                    <Link to="/code-editor/profile">
                        <FontAwesomeIcon icon={faUser} /> Profile
                    </Link>
                </li>
                <li>
                    <Link to="/code-editor/teams">
                        <FontAwesomeIcon icon={faUsers} /> Find Teams
                    </Link>
                </li>
                <li>
                    <Link to="/code-editor/teams/join">
                        <FontAwesomeIcon icon={faCode} /> My Teams
                    </Link>
                </li>
                <li>
                    <Link to="/code-editor/teams/join-requests">
                        <FontAwesomeIcon icon={faAddressBook} /> view join request
                    </Link>
                </li>
                <li>
                    <Link to="/Login">
                        <FontAwesomeIcon icon={faSignOut} /> sign out
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;