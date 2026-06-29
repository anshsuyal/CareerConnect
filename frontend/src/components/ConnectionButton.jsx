import React, { useCallback, useContext, useEffect, useState } from 'react'
import { authDataContext, socket } from '../context/AuthContext'
import axios from 'axios'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Something went wrong'

function ConnectionButton({userId}) {
const {serverUrl}=useContext(authDataContext)
const {userData}=useContext(userDataContext)
const currentUserId = userData?._id ?? null
const [status,setStatus]=useState("connect")
const navigate=useNavigate()
const buttonClasses = [
  "min-w-[110px]",
  "rounded-full",
  "px-4",
  "py-2",
  "text-sm",
  "font-semibold",
  "transition",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-sky-200",
  status==="pending" ? "bg-slate-200 text-slate-500" :
  status==="disconnect" ? "bg-red-50 text-red-500 hover:bg-red-100" :
  status==="received" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
  "bg-sky-500 text-white hover:bg-sky-600",
  "disabled:cursor-not-allowed",
  "shadow-sm"
].join(" ")

    const handleSendConnection=async ()=>{
        if(!userId){
            return
        }
        try {
            await axios.post(`${serverUrl}/api/connection/send/${userId}`,{},{withCredentials:true})
            setStatus("pending")
            await handleGetStatus()
            
        } catch (error) {
            console.error('Failed to send connection:', getErrorMessage(error))
        }
    }
    const handleRemoveConnection=async ()=>{
        if(!userId){
            return
        }
        try {
            await axios.delete(`${serverUrl}/api/connection/remove/${userId}`,{withCredentials:true})
            setStatus("connect")
            await handleGetStatus()
        } catch (error) {
            console.error('Failed to remove connection:', getErrorMessage(error))
        }
    }
    const handleGetStatus=useCallback(async ()=>{
        if(!userId){
            return
        }
        try {
            const result=await axios.get(`${serverUrl}/api/connection/getstatus/${userId}`,{withCredentials:true})
            setStatus(result.data?.status ?? "connect")
            
        } catch (error) {
            console.error('Failed to fetch connection status:', getErrorMessage(error))
            setStatus("connect")
        }
    },[serverUrl,userId])

useEffect(()=>{
    if(currentUserId){
        socket.emit("register",currentUserId)
    }
    handleGetStatus()

    const handleStatusUpdate = ({updatedUserId,newStatus})=>{
if(updatedUserId===userId){
    setStatus(newStatus ?? "connect")
}
    }

    socket.on("statusUpdate",handleStatusUpdate)

    return ()=>{
        socket.off("statusUpdate",handleStatusUpdate)
    }

},[userId,currentUserId,handleGetStatus])

const handleClick=async ()=>{
    if(status==="disconnect"){
      await handleRemoveConnection()
    }else if(status==="received"){
        navigate("/network")
    }else if(status==="pending"){
        // do nothing while pending
    }else{
await handleSendConnection()
    }
}

  const statusLabel = status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : 'Connect'

  return (
    <button className={buttonClasses} onClick={handleClick} disabled={status==="pending"}>
        {statusLabel}
        </button>
  )
}

export default ConnectionButton

