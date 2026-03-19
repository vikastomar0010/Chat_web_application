import React, { useEffect, useRef, useState } from 'react'
import { Chatstate } from "../Context/Context";
import {Box,Button,FormControl,IconButton,Input,Text} from '@chakra-ui/react'
import {ArrowBackIcon} from '@chakra-ui/icons'
import { getSender,getSenderfull } from './Somelogic';
import ProfileModal from './ProfileModal';
import UpdateGroupModal from './UpdateGroupModal';
import axios from 'axios';
import './stylem.css'
import Scrollablechat from './Scrollablechat';
import { io } from "socket.io-client";
import animationData from '../Animation/lottie.json'
import Lottie from 'react-lottie'
import ImageModal from './ImageModal'
import { API_BASE_URL, SOCKET_ENDPOINT } from '../config';

const ENDPOINT = SOCKET_ENDPOINT;
var sockets, selectedChatCompare;

function Singlechat({fetchAgain,setfetch}) {

  const [messages,setMessage]=useState([])
  const [newmessage,setNewMessage]=useState("")
  const [loading,setloading]=useState(false)
  const [typing,settyping]=useState(false)
  const [istyping,setistyping]=useState(false)
  const [socketConnected,setsocketConnected]=useState(false)
  const [refetch,setrefetch]=useState(false)
  const [upload,setuploda]=useState(false)

  const {selectedChat, setSelectedChat, user}=Chatstate()

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // ✅ SOCKET INIT
  useEffect(()=>{
    sockets = io(ENDPOINT);

    sockets.emit("setup",user)

    sockets.on("connected",()=>setsocketConnected(true))
    sockets.on("typing",()=>setistyping(true))
    sockets.on("stop typing",()=>setistyping(false))

    return () => sockets.disconnect()
  },[]) 

  // ✅ FETCH MESSAGES
  const fethmessages=async()=>{
    if(!selectedChat) return;

    setloading(true)

    try{
      const config={ 
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${user.token}`
        }
      }

      const {data}=await axios.get(
        `${API_BASE_URL}/api/v1/message/${selectedChat._id}`,
        config
      )

      setMessage(data)
      sockets.emit('join chat', selectedChat._id)

    }catch(err){
      console.log(err)
    }

    setloading(false)
  }

  useEffect(()=>{
    fethmessages()
    selectedChatCompare=selectedChat
  },[selectedChat,refetch])

  // ✅ RECEIVE MESSAGE (FIXED)
  useEffect(()=>{
    const handler = (newmessage) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newmessage.chat._id) {
        return;
      }

      setMessage(prev => [...prev, newmessage])

      sockets.emit("message delivered", newmessage._id)
    }

    sockets.on("message recieved", handler)

    return () => sockets.off("message recieved", handler)
  },[])

  // ✅ DELIVERED LISTENER
  useEffect(()=>{
    const handler = (messageId) => {
      setMessage(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      )
    }

    sockets.on("message delivered", handler)

    return () => sockets.off("message delivered", handler)
  },[])

  // ✅ SEEN EMIT
  useEffect(()=>{
    if(!selectedChat) return
    sockets.emit("mark seen", selectedChat._id)
  },[selectedChat])

  // ✅ SEEN LISTENER
  useEffect(()=>{
    const handler = (chatId) => {
      setMessage(prev =>
        prev.map(msg =>
          msg.chat?._id === chatId
            ? { ...msg, status: "seen" }
            : msg
        )
      )
    }

    sockets.on("messages seen", handler)

    return () => sockets.off("messages seen", handler)
  },[])

  // ✅ SEND MESSAGE
  const sendMessage=async()=>{
    if(!newmessage) return;

    sockets.emit("stop typing", selectedChat._id)

    try{
      const config={
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${user.token}`
        }
      }

      setNewMessage("")

      const {data}=await axios.post(
        `${API_BASE_URL}/api/v1/message`,
        {content:newmessage,chatId:selectedChat._id},
        config
      )

      sockets.emit("new message",data)
      setMessage(prev => [...prev,data])

    }catch(err){
      console.log(err)
    }
  }

  // ✅ SEND IMAGE
  const sendDoc = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", selectedChat._id);

    try {
      setuploda(true);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/message/img`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      sockets.emit("new message", data);
      setMessage(prev => [...prev, data]);

      setuploda(false);
    } catch (error) {
      setuploda(false);
      console.log(error);
    }
  };

  // ✅ TYPING
  const typinghandler=(e)=>{
    setNewMessage(e.target.value)

    if(!socketConnected) return;

    if(!typing){
      settyping(true)
      sockets.emit('typing',selectedChat._id)
    }

    let lastTypingTime = new Date().getTime();

    setTimeout(()=>{
      let timeNow=new Date().getTime()
      let timediff=timeNow-lastTypingTime

      if(timediff>=4000 && typing){
        sockets.emit("stop typing", selectedChat._id)
        settyping(false)
      }
    },4000)
  }

  return (
    <>
    {selectedChat?(<>
       <Text
         fontSize={{base:"28px",md:"30px"}}
         pb={3}
         px={2}
         w="100%"
         fontFamily="Work sans"
         display="flex"
         justifyContent={{base:"space-between"}}
         alignItems="center"
       >
        <IconButton
          display={{base:"flex",md:"none"}}
          icon={<ArrowBackIcon/>}
          onClick={()=>setSelectedChat("")}
        />
        {!selectedChat.isGroupchat?(<>
             {getSender(user,selectedChat.users)}
             <ProfileModal user={getSenderfull(user,selectedChat.users)}/>
        </>):(
            <>
              {selectedChat.chatName.toUpperCase()}
              <UpdateGroupModal
                fetchAgain={fetchAgain}
                setfetch={setfetch}
                fetchmessage={fethmessages}
              />
            </>
        )}
       </Text>

       <Box
         display="flex"
         flexDir="column"
         justifyContent="flex-end"
         p={3}
         bg="black"
         w="100%"
         h="100%"
         borderRadius="lg"
         overflowY="hidden"
       >
        {loading ? "Loading..." : (
          <div className='message'>
            <Scrollablechat
              messages={messages}
              fmsg={()=>setrefetch(!refetch)}
              uploadb={upload}
            />
          </div>
        )}

        {istyping && (
          <Lottie options={defaultOptions} height={50} width={70} />
        )}

        <FormControl
          display="flex"
          onKeyDown={(e)=>{
            if(e.key==="Enter"){
              e.preventDefault();
              sendMessage();
            }
          }}
          border="none"
          isRequired
        >
          <Input
            flex="1"
            placeholder="Enter the message"
            value={newmessage}
            onChange={typinghandler}
          />

          <ImageModal docfn={sendDoc}>
            <Button>Upload</Button>
          </ImageModal>
        </FormControl>

       </Box>
    </>):(
      <Box display="flex" alignItems="center" justifyContent="center" h="100%">
        <Text fontSize="3xl">
          Click on the user to start the chats
        </Text>
      </Box>
    )}
    </>
  )
}

export default Singlechat;