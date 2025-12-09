// Need form to post url
// want to be able to view it on the page
// Also want to be able to delete your articles

import { useState } from 'react'

export default function Board(){

    const handleSubmit = async function(e){
        console.log("Adding an article");
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <p>
                    What is the Title of your Post?
                    <input type="text" placeholder="Title"></input>
                </p>

                <p>
                    Enter URL Here
                    <input type="text" placeholder = "Enter URL"></input>
                </p>

                <p>
                    <textarea id="opinion" name = "opinion" rows="4" cols="30" 
                    placeholder="What are your thoughts on this article?"></textarea>
                </p>

                <button type="Submit">Submit</button>
            </form>
        </div>
    )
}