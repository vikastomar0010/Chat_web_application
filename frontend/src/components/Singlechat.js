import React, { useEffect, useState } from 'react'
import { Chatstate } from "../Context/Context";
import {
  Box, Button, FormControl, IconButton,
  Input, Text, Flex, Avatar
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderfull } from './Somelogic';
import ProfileModal from './ProfileModal';
import axios from 'axios';
import Scrollablechat from './Scrollablechat';
import { io } from "socket.io-client";
import animationData from '../Animation/lottie.json'
import Lottie from 'react-lottie'
import ImageModal from './ImageModal'
import { API_BASE_URL, SOCKET_ENDPOINT } from '../config';

const ENDPOINT = SOCKET_ENDPOINT;
var sockets, selectedChatCompare;

function Singlechat({ fetchAgain, setfetch }) {

  const [messages, setMessage] = useState([])
  const [newmessage, setNewMessage] = useState("")
  const [loading, setloading] = useState(false)
  const [typing, settyping] = useState(false)
  const [istyping, setistyping] = useState(false)
  const [socketConnected, setsocketConnected] = useState(false)
  const [refetch, setrefetch] = useState(false)
  const [upload, setuploda] = useState(false)
  const [isOnline, setIsOnline] = useState(false)

  const { selectedChat, setSelectedChat, user } = Chatstate()

  const otherUser = selectedChat && !selectedChat.isGroupchat
    ? selectedChat.users.find(u => u._id !== user._id)
    : null;

  const formatLastSeen = (time) => {
    if (!time) return "Offline";
    const diff = (new Date() - new Date(time)) / 1000;

    if (diff < 60) return "Last seen just now";
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hr ago`;

    return `Last seen ${new Date(time).toLocaleDateString()}`;
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  // 🔥 SOCKET SETUP
  useEffect(() => {
    sockets = io(ENDPOINT);

    sockets.emit("setup", user)

    sockets.on("connected", () => setsocketConnected(true))
    sockets.on("typing", () => setistyping(true))
    sockets.on("stop typing", () => setistyping(false))

    sockets.on("user online", (userId) => {
      if (otherUser && userId === otherUser._id) {
        setIsOnline(true)
      }
    })

    sockets.on("user offline", (userId) => {
      if (otherUser && userId === otherUser._id) {
        setIsOnline(false)
      }
    })

    return () => sockets.disconnect()
  }, [])

  useEffect(() => {
    if (otherUser) {
      setIsOnline(otherUser.isOnline)
    }
  }, [selectedChat])

  // 🔥 FETCH MESSAGES
  const fethmessages = async () => {
    if (!selectedChat) return;

    setloading(true)

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/api/v1/message/${selectedChat._id}`,
        config
      )

      setMessage(data)
      sockets.emit('join chat', selectedChat._id)

    } catch (err) {
      console.log(err)
    }

    setloading(false)
  }

  useEffect(() => {
    fethmessages()
    selectedChatCompare = selectedChat
  }, [selectedChat, refetch])

  // 🔥 MESSAGE RECEIVE + DELIVERED
  useEffect(() => {
    const handler = (newmessage) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newmessage.chat._id) return;

      setMessage(prev => [...prev, newmessage]);

      // ✅ DELIVERED EMIT
      sockets.emit("message delivered", newmessage._id);
    }

    sockets.on("message recieved", handler)

    return () => sockets.off("message recieved", handler)
  }, [])

  // 🔥 DELIVERED LISTENER
  useEffect(() => {
    const handler = (messageId) => {
      setMessage(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    };

    sockets.on("message delivered", handler);

    return () => sockets.off("message delivered", handler);
  }, []);

  // 🔥 MARK SEEN
  useEffect(() => {
    if (!selectedChat) return;

    sockets.emit("mark seen", selectedChat._id)
  }, [selectedChat])

  // 🔥 SEEN LISTENER (BLUE TICK)
  useEffect(() => {
    const handler = (chatId) => {
      setMessage(prev =>
        prev.map(msg => {
          const msgChatId =
            typeof msg.chat === "object"
              ? msg.chat._id
              : msg.chat;

          return msgChatId === chatId
            ? { ...msg, status: "seen" }
            : msg;
        })
      )
    }

    sockets.on("messages seen", handler)

    return () => sockets.off("messages seen", handler)
  }, [])

  const sendMessage = async () => {
    if (!newmessage) return;

    sockets.emit("stop typing", selectedChat._id)

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      setNewMessage("")

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/message`,
        { content: newmessage, chatId: selectedChat._id },
        config
      )

      sockets.emit("new message", data)
      setMessage(prev => [...prev, data])

    } catch (err) {
      console.log(err)
    }
  }

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

  const typinghandler = (e) => {
    setNewMessage(e.target.value)

    if (!socketConnected) return;

    if (!typing) {
      settyping(true)
      sockets.emit('typing', selectedChat._id)
    }

    let lastTypingTime = new Date().getTime();

    setTimeout(() => {
      let timeNow = new Date().getTime()
      if (timeNow - lastTypingTime >= 3000 && typing) {
        sockets.emit("stop typing", selectedChat._id)
        settyping(false)
      }
    }, 3000)
  }

  return (
    <>
      {selectedChat ? (
        <Box display="flex" flexDir="column" h="100%">

          <Flex bg="#202c33" color="white" p={3} align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />
              <Avatar size="sm" src={otherUser?.profilePic} />
              <Box>
                <Text fontWeight="bold">
                  {getSender(user, selectedChat.users)}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {isOnline ? "Online" : formatLastSeen(otherUser?.lastSeen)}
                </Text>
              </Box>
            </Flex>

            {!selectedChat.isGroupchat && (
              <ProfileModal user={getSenderfull(user, selectedChat.users)} />
            )}
          </Flex>

          <Box flex="1" overflowY="auto" px={2} bg="#0b141a">
            {loading ? "Loading..." : (
              <Scrollablechat messages={messages} uploadb={upload} />
            )}
          </Box>

          {istyping && (
            <Lottie options={defaultOptions} height={40} width={60} />
          )}

          <FormControl display="flex" p={2} bg="#202c33" alignItems="center" gap={2}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          >
            <Button bg="transparent" color="gray.400">😊</Button>

            <Input
              bg="#2a3942"
              color="white"
              borderRadius="full"
              placeholder="Type a message"
              value={newmessage}
              onChange={typinghandler}
            />

            <ImageModal docfn={sendDoc}>
              <Button bg="transparent" color="gray.400">📎</Button>
            </ImageModal>

            <Button bg="transparent" color="gray.400">🎤</Button>

            <Button bg="#25D366" color="white" onClick={sendMessage}>
              ➤
            </Button>
          </FormControl>

        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" color="gray.500">
            Select a chat to start messaging
          </Text>
        </Box>
      )}
    </>
  )
}

export default Singlechat;