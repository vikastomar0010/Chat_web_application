import React, { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Chatstate } from '../Context/Context'
import Sidedrawer from '../Chats/Sidedrawer'
import Mychats from '../Chats/Mychats'
import Chatbox from '../Chats/Chatbox'
import io from "socket.io-client"
import { SOCKET_ENDPOINT } from "../config"

let socket;

function Chatpage() {
  const { user } = Chatstate()
  const [fetchChatAgain, setfetchchat] = useState(false)

  useEffect(() => {
    if (!user) return;

    socket = io(SOCKET_ENDPOINT);

    socket.emit("setup", user);

    socket.on("connected", () => {
      console.log("Socket connected");
    });

    socket.on("user online", (userId) => {
      console.log("User online:", userId);
    });

    socket.on("user offline", (userId) => {
      console.log("User offline:", userId);
    });

    return () => {
      socket.disconnect();
    };

  }, [user]);

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      bg="#111b21"   // WhatsApp dark background
      overflow="hidden"
    >
      {/* LEFT SIDEBAR */}
      {user && (
        <Box
          w={{ base: "100%", md: "30%" }}
          bg="#202c33"
          borderRight="1px solid #2a3942"
          display="flex"
          flexDirection="column"
        >
          <Sidedrawer />
          <Mychats fetchAgain={fetchChatAgain} />
        </Box>
      )}

      {/* RIGHT CHAT AREA */}
      {user && (
        <Box
          w={{ base: "100%", md: "70%" }}
          display="flex"
          flexDirection="column"
          bg="#0b141a"
        >
          <Chatbox fetchAgain={fetchChatAgain} setfetch={setfetchchat} />
        </Box>
      )}
    </Box>
  )
}

export default Chatpage