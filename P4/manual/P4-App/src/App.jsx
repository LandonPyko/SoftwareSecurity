import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login'
import Board from './Board'

function App() {
  const [count, setCount] = useState(0)
  
  return <Board/>;

  // if logged in, go to article board page
  // if (user){return <Board/>}
  
}

export default App
