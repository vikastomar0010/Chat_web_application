import React, { useEffect, useState } from "react";
import { Chatstate } from "../Context/Context";
import { Box, Button, Stack, useToast, Text } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import { getSender } from "../components/Somelogic";
import Groupchatmodal from "../components/Groupchatmodal";
import { API_BASE_URL } from "../config";

function Mychats({fetchAgain}) {
  const [loggeduser, setloggeduser] = useState();
  const { selectedChat, setSelectedChat, chats, setChats, user } = Chatstate();
  const toast = useToast();
  const fetchData = async () => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: user?.token ? `Bearer ${user.token}` : "",
        },
      };

      const { data } = await axios.get(
        `${API_BASE_URL}/api/v1/chat`,
        config
      );

      setChats(data);
    } catch (err) {
      toast({
        title: "Error Occurred",
        description: err.message, // use err.message to get the error message
        status: "error", // use 'error' instead of 'success' for error status
        duration: 5000,
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    setloggeduser(JSON.parse(localStorage.getItem("userInfo")));
    fetchData();
   
    // eslint-disable-next-line
  }, [fetchAgain]); // Include dependencies in the dependency array

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#2a2438"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
     
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Works sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <Groupchatmodal />
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="black"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflow="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((e) => (
              <Box
                onClick={() =>{ setSelectedChat(e);console.log(selectedChat)}}
                cursor="pointer"
                bg={selectedChat === e ? "#38B2AC" : "#4c4a4f"}
                color={selectedChat === e ? "white" : "white "}
                px={3}
                py={3}
                borderRadius="lg"
                key={e._id}
              >
                <Text>
                  {!e.isGroupchat ? getSender(loggeduser, e.users) : e.chatName}
                </Text>
             { e?.latestMessage?.content &&  <Text fontFamily="Work sans">'{e?.latestMessage?.content}'</Text>}
              </Box>
            ))}
          </Stack>
        ) : (
          <h2>Loading</h2>
        )}
      </Box>
    </Box>
  );
}

export default Mychats;
