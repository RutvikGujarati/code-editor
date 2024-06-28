import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth';
import Signup from './components/Signup';
import CodeEditor from './components/CodeEditor';
import Profile from './profile/profile';
import { UserProvider } from './context/UserContext';
import Team from './profile/team';
import ApprovalRequests from './profile/approveReq';
import MyTeam from './profile/MyTeam';

const App = () => (

  <UserProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path="/editor" element={<CodeEditor teamId={10} username={"rutvik"} />} />
          <Route path="/code-editor/teams" element={<Team />} />
          <Route path="/" exact element={<Login />} />
          <Route path="/code-editor/profile" element={<Profile />} />
          <Route path="/code-editor/teams/join" element={<MyTeam />} />
          <Route path="/code-editor/teams/join-requests" element={<ApprovalRequests />} />

        </Routes>
      </div>
    </Router>
  </UserProvider>
);

export default App;
