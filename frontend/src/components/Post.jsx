import React, { useContext, useEffect, useState } from 'react'
import dp from "../assets/dp.webp"
import moment from "moment"
import { FaRegCommentDots } from "react-icons/fa";
import { BiLike, BiSolidLike } from "react-icons/bi";
import axios from 'axios';
import { authDataContext, socket } from '../context/AuthContext';
import { userDataContext } from '../context/UserContext';
import { LuSendHorizontal } from "react-icons/lu";
import ConnectionButton from './ConnectionButton';

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Something went wrong'

function Post({ id, author, like, comment, description, image,createdAt }) {
  const {serverUrl}=useContext(authDataContext)
  const {userData,handleGetProfile}=useContext(userDataContext)
  const [more,setMore]=useState(false)
  const [likes,setLikes]=useState(Array.isArray(like) ? like : [])
  const [comments,setComments]=useState(Array.isArray(comment) ? comment : [])
  const [commentContent,setCommentContent]=useState("")
  const [showComment,setShowComment]=useState(false)

  useEffect(()=>{
    setLikes(Array.isArray(like) ? like : [])
  },[like])

  useEffect(()=>{
    setComments(Array.isArray(comment) ? comment : [])
  },[comment])

  useEffect(()=>{
    const handleLikeUpdated = ({postId,likes:updatedLikes})=>{
      if(postId===id){
        setLikes(Array.isArray(updatedLikes) ? updatedLikes : [])
      }
    }
    const handleCommentAdded = ({postId,comm})=>{
      if(postId===id){
        setComments(Array.isArray(comm) ? comm : [])
      }
    }
    socket.on("likeUpdated",handleLikeUpdated)
    socket.on("commentAdded",handleCommentAdded)

    return ()=>{
      socket.off("likeUpdated",handleLikeUpdated)
      socket.off("commentAdded",handleCommentAdded)
    }
  },[id])

    const handleLike=async ()=>{
      if(!id){
        return
      }
      try {
        const result=await axios.get(`${serverUrl}/api/post/like/${id}`,{withCredentials:true})
        setLikes(Array.isArray(result.data.like) ? result.data.like : [])
      } catch (error) {
        console.error('Failed to like post:', getErrorMessage(error))
      }
    }
    const handleComment=async (e)=>{
       e.preventDefault()
       const trimmedComment = commentContent.trim()
       if(!trimmedComment || !id){
        return
       }
        try {
          const result=await axios.post(`${serverUrl}/api/post/comment/${id}`,{
            content:trimmedComment
          },{withCredentials:true})
          setComments(Array.isArray(result.data.comment) ? result.data.comment : [])
        setCommentContent("")
        } catch (error) {
          console.error('Failed to add comment:', getErrorMessage(error))
        }
      }


    const handleNavigateProfile = ()=>{
      if(author?.userName){
        handleGetProfile(author.userName)
      }
    }

    const currentUserId = userData?._id
    const hasLiked = currentUserId ? likes.includes(currentUserId) : false
    const authorName = `${author?.firstName ?? ''} ${author?.lastName ?? ''}`.trim() || 'LinkedIn Member'
    const authorHeadline = author?.headline ?? ''
    const createdAtLabel = createdAt ? moment(createdAt).fromNow() : ''
    const commentCount = comments.length


    return (
        <div className="w-full rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-md transition hover:shadow-lg">

          <div className='flex items-start justify-between gap-4'>

            <button className='flex flex-1 items-start gap-4 text-left' onClick={handleNavigateProfile}>
                <div className='h-14 w-14 overflow-hidden rounded-full border border-slate-200'>
                    {author?.profileImage ? (
                      <img src={author.profileImage} alt={authorName} loading="lazy" className='h-full w-full object-cover' />
                    ) : (
                      <img src={dp} alt="Default profile" loading="lazy" className='h-full w-full object-cover' />
                    )}
                </div>
                <div className='flex flex-col'>
                <span className='text-lg font-semibold text-slate-900'>{authorName}</span>
                <span className='text-sm font-medium text-slate-500'>{authorHeadline}</span>
                <span className='text-xs font-semibold uppercase tracking-wide text-slate-400'>{createdAtLabel}</span>
                </div>
            </button>
            <div className='flex items-center'>

              {currentUserId && author?._id &&  currentUserId!==author._id &&  <ConnectionButton userId={author._id}/>}
           
              
            </div>
            </div>
         <div className={`mt-4 w-full text-[15px] leading-relaxed text-slate-700 ${!more?"line-clamp-4":""}`}>{description ?? ''}</div>
         {description && description.length>160 && <button className='mt-3 text-sm font-semibold text-sky-500 transition hover:text-sky-600' onClick={()=>setMore(prev=>!prev)}>{more?"Show less":"Read more"}</button>}

{image && 
         <div className='mt-4 flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50'>
<img src={image} alt="Post attachment" loading="lazy" className='h-full w-full object-cover'/>
</div>}

<div className='mt-6'>
<div className='flex w-full items-center justify-between border-y border-slate-200 py-4'>
<div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
    <BiLike className='h-5 w-5 text-sky-500'/><span>{likes.length}</span></div>
<button className='flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-sky-500' onClick={()=>setShowComment(prev=>!prev)}><span>{commentCount}</span><span>Comments</span></button>
</div>
<div className='flex w-full items-center justify-start gap-6 py-4 text-sm font-semibold text-slate-500'>
{hasLiked &&  <button className='flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sky-600 transition hover:bg-sky-100' onClick={handleLike}>
<BiSolidLike className='h-5 w-5'/>
<span>Liked</span>
</button>}
{!hasLiked &&  <button className='flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500' onClick={handleLike}>
<BiLike className='h-5 w-5'/>
<span>Like</span>
</button>}

<button className='flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500' onClick={()=>setShowComment(prev=>!prev)}>
<FaRegCommentDots className='h-5 w-5'/>
<span>Comment</span>
</button>
</div>

{showComment && <div className='rounded-2xl border border-slate-200 bg-slate-50/60 p-4'>
    <form className="flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 transition focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100
    " onSubmit={handleComment}>
    <input type="text" placeholder="Leave a thoughtful comment..." className='flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none' value={commentContent} onChange={(e)=>setCommentContent(e.target.value)}/>
    <button type="submit" disabled={!commentContent.trim()} className='rounded-full bg-sky-500 p-2 text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300'><LuSendHorizontal className="h-4 w-4"/></button>
    </form>

    <div className='mt-4 flex flex-col gap-3'>
       {comments.map((com,index)=>(
        <div key={com?._id ?? `${id}-comment-${index}`} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
            <div className='h-10 w-10 overflow-hidden rounded-full border border-slate-200'>
                    {com?.user?.profileImage ? (
                      <img src={com.user.profileImage} alt={`${com?.user?.firstName ?? ''} ${com?.user?.lastName ?? ''}`} loading="lazy" className='h-full w-full object-cover' />
                    ) : (
                      <img src={dp} alt="Default profile" loading="lazy" className='h-full w-full object-cover' />
                    )}
                </div> 
                
                <div className='text-sm font-semibold text-slate-800'>{`${com?.user?.firstName ?? ''} ${com?.user?.lastName ?? ''}`.trim()}</div>
              
                
            </div>
            <div className='mt-3 text-sm text-slate-600'>{com?.content ?? ''}</div>
        </div>
       ))} 
    </div>
</div>}

</div>
         
        </div>
    )
}

export default Post
