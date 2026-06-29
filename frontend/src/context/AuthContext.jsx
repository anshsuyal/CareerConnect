import React, { createContext } from 'react'
import { io } from 'socket.io-client'

export const authDataContext=createContext()
export const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8000")

function AuthContext({children}) {
const serverUrl= import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
    let value={
        serverUrl
    }
  return (
    <div>
     <authDataContext.Provider value={value}> 
     {children}
     </authDataContext.Provider> 
    </div>
  )
}

export default AuthContext
