import { useState } from "react";
import axios from "axios";



export default function Login({ onLogin, onSignupClick, currentUser}) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();


        const info = { username: name, pw: password };

        const res = await axios.post("http://localhost:3000/login", info);

        console.log("Server response:", res.data);

        if (res.data.success) {
            alert("Logged in!");
            onLogin(name);   // ⬅ Sends the user to Board.jsx
        } else {
            alert("Login failed");
        }
    };
    const handleSignupClick = async(e) => {
        e.preventDefault();
        onSignupClick();
    };

    return (
        <div>
            <h2>Login Here</h2>

            <form onSubmit={handleSubmit}>
                <p>
                    Username
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setName(e.target.value)}
                    />
                </p>

                <p>
                    Password
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </p>

                <button type="submit">Submit</button>
            </form>
            <button onClick={handleSignupClick}>Create Account</button>
        </div>
        
    );
}
