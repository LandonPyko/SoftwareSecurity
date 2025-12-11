import { useState, useEffect } from 'react';
import axios from 'axios'

export default function Board({ currentUser , onLogout}) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [opinion, setOpinion] = useState('');
    const [posts, setPosts] = useState([]);

    // Fetch posts from backend
    useEffect(() => {
        const fetchPosts = async () => {
            const res = await axios.get("http://localhost:3000/posts");
            const data = res.data;
            setPosts(data);
        };
        fetchPosts();
    }, []);

    // Submit a post
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPost = { username: currentUser, title, url, opinion };

        const res = await axios.post("http://localhost:3000/posts", 
            newPost,{headers: { "Content-Type": "application/json" }}
        );

        const data = res.data;
        if (data.success) {
            setPosts(prev => [data.post, ...prev]);
            setTitle("");
            setUrl("");
            setOpinion("");
        }
    };
    // Delete a post
    const handleDelete = async (id) => {
        const res = await axios.delete(`http://localhost:3000/posts/${id}`);

        const data = res.data;
        if (data.success) {
            setPosts(prev => prev.filter(p => p.id !== id));
        }
    };



    return (
        <div>
            <h1>Article Board</h1>
            <div>
                <h3>You are logged in as: {currentUser}</h3>
                <br></br>
                <button onClick={onLogout}>Log Out</button>
            </div>

            {/* Submit Form */}
            <form onSubmit={handleSubmit}>
                <p>
                    Title:
                    <input 
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </p>

                <p>
                    URL:
                    <input 
                        type="text" 
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </p>

                <p>
                    <textarea 
                        rows="4"
                        cols="40"
                        value={opinion}
                        onChange={e => setOpinion(e.target.value)}
                        placeholder="Your thoughts"
                    />
                </p>

                <button type="submit">Submit</button>
            </form>

            <hr />

            {/* Posts */}
            <h2>All Posts</h2>
            {posts.length === 0 ? (
                <p>No posts yet.</p>
            ) : (
                posts.map(post => (
                    <div key={post.id} style={{border: "1px solid #ccc", margin: 10, padding: 10}}>
                        <h3>{post.title}</h3>
                        <p><a href={post.url} target="_blank">{post.url}</a></p>
                        <p>{post.opinion}</p>
                        <p><i>Posted by: {post.username}</i></p>
                        {/* Convoluted check to fix timing issue. Fixes asynchronous check */}
                        {post.username && currentUser && (post.username === currentUser || currentUser === "admin") && (
                            <button onClick={() => handleDelete(post.id)}>Delete</button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
