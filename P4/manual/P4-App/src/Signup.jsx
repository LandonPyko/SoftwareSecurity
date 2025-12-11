import { useState } from "react";
import axios from "axios";

export default function Signup({ onSignup }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const info = { username: name, pw: password };
        const res = await axios.post("http://localhost:3000/signup", info);

        if (res.data.success) {
            onSignup();   // go back to login page
        } else {
            alert(res.data.message);
        }
    };

    return (
        <div>
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
                <p>
                    Username:
                    <input type="text" onChange={(e) => setName(e.target.value)} />
                </p>

                <p>
                    Password:
                    <input type="password" onChange={(e) => setPassword(e.target.value)} />
                </p>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
