import { useState } from 'react'
// Need an admin account

export default function Login(){
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(){
        alert("Creating " + name + " " + password);
    }
    return(
    <div>
        Login Here
        <form onSubmit = {handleSubmit}>
            <p>Username
                <input type="text" placeholder="Username"
                onChange = {(e)=> setName(e.target.value)}></input>
            </p>

            <p>Password
                <input type="password" placeholder="Password"
                onChange = {(e)=> setPassword(e.target.value)}></input>
            </p>
            <button type="Submit">Submit</button>
        </form>
    </div>
    );
    console.log("Testing")
}