import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login';
import Signup from './Signup';
import Board from './Board';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [signupMode, setSignupMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    function handleLogout(){
      setCurrentUser(null);
      setLoggedIn(null);
    }
    if (signupMode) {
        return <Signup onSignup={() => setSignupMode(false)} />;
    }

    if (loggedIn) {
        return <Board currentUser={currentUser}  onLogout={handleLogout}/>;
    }

    return (
        <Login
            onLogin={(username) => {
                setCurrentUser(username);  // save username
                setLoggedIn(true);         // switch to board
            }}
            onSignupClick={() => setSignupMode(true)}
        />
    );
}

export default App;
