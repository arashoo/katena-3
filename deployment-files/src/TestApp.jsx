import React, { useState } from 'react'

function TestApp() {
  const [count, setCount] = useState(0)

  return (
    <div style={{padding: '50px'}}>
      <h1>React Test App</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{padding: '20px', fontSize: '20px', backgroundColor: 'blue', color: 'white'}}
      >
        Click Me! Current count: {count}
      </button>
    </div>
  )
}

export default TestApp
