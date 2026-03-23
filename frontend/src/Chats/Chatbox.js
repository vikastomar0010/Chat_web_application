import React from 'react'
import { Chatstate } from "../Context/Context";
import { Box } from '@chakra-ui/react';
import Singlechat from '../components/Singlechat';

function Chatbox({ fetchAgain, setfetch }) {
  const { selectedChat } = Chatstate()

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: 'flex' }}
      flexDir="column"
      w={{ base: '100%', md: '70%' }}
      h="100%"                // ✅ VERY IMPORTANT
      bg="#0b141a"            // WhatsApp background
      overflow="hidden"       // ✅ prevents outer scroll
    >
      <Singlechat fetchAgain={fetchAgain} setfetch={setfetch} />
    </Box>
  )
}

export default Chatbox