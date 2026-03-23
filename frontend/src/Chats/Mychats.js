import React, { useEffect, useState } from "react";
import { Chatstate } from "../Context/Context";
import {
  Box,
  Stack,
  useToast,
  Text,
  Avatar,
  Flex,
  Input
} from "@chakra-ui/react";
import axios from "axios";
import { getSenderfull } from "../components/Somelogic";
import Groupchatmodal from "../components/Groupchatmodal";
import { API_BASE_URL } from "../config";

function Mychats({ fetchAgain }) {
  const [loggeduser, setloggeduser] = useState();
  const [search, setSearch] = useState("");

  // ✅ ADD notifications
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    user,
    notifications,
    setNotifications
  } = Chatstate();

  const toast = useToast();

  const fetchData = async () => {
    try {
      const config = {
        headers: {
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
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    setloggeduser(JSON.parse(localStorage.getItem("userInfo")));
    fetchData();
  }, [fetchAgain]);

  // 🔍 FILTER CHAT
  const filteredChats = chats?.filter((chat) => {
    const name = !chat.isGroupchat
      ? getSenderfull(loggeduser, chat.users)?.name
      : chat.chatName;

    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box display="flex" flexDir="column" bg="#111b21" h="100%" overflow="hidden">

      {/* HEADER */}
      <Flex justify="space-between" align="center" p={3} bg="#202c33">
        <Text color="white" fontSize="xl" fontWeight="bold">
          Chats
        </Text>
        <Groupchatmodal />
      </Flex>

      {/* SEARCH */}
      <Box p={2}>
        <Flex align="center" bg="#202c33" borderRadius="full" px={3}>
          <Text color="gray.400" mr={2}>🔍</Text>
          <Input
            placeholder="Search or start new chat"
            variant="unstyled"
            color="white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Flex>
      </Box>

      {/* CHAT LIST */}
      <Stack overflowY="auto" spacing={0}>
        {filteredChats?.map((chat) => {

          const otherUser = !chat.isGroupchat
            ? getSenderfull(loggeduser, chat.users)
            : null;

          // ✅ COUNT UNREAD FROM NOTIFICATIONS
          const unreadCount = notifications?.filter(
            (n) => n.chat._id === chat._id
          ).length;

          return (
            <Flex
              key={chat._id}
              onClick={() => {
                setSelectedChat(chat);

                // ✅ CLEAR NOTIFICATIONS FOR THIS CHAT
                setNotifications(prev =>
                  prev.filter(n => n.chat._id !== chat._id)
                );
              }}
              align="center"
              p={3}
              cursor="pointer"
              bg={selectedChat === chat ? "#2a3942" : "transparent"}
              _hover={{ bg: "#2a3942" }}
              borderBottom="1px solid #1f2c33"
            >

              {/* AVATAR */}
              <Box position="relative" mr={3}>
                <Avatar
                  size="md"
                  name={chat.isGroupchat ? chat.chatName : otherUser?.name}
                  src={otherUser?.profilePic}
                />

                {!chat.isGroupchat && otherUser?.isOnline && (
                  <Box
                    position="absolute"
                    bottom="2px"
                    right="2px"
                    w="10px"
                    h="10px"
                    bg="green.400"
                    borderRadius="full"
                    border="2px solid #111b21"
                  />
                )}
              </Box>

              {/* TEXT */}
              <Box flex="1">
                <Flex justify="space-between">
                  <Text color="white" fontWeight="500">
                    {!chat.isGroupchat ? otherUser?.name : chat.chatName}
                  </Text>

                  <Text fontSize="xs" color="gray.400">
                    {chat.latestMessage?.createdAt
                      ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.400" noOfLines={1}>
                    {chat.latestMessage?.content || "No messages yet"}
                  </Text>

                  {/* ✅ REAL UNREAD BADGE */}
                  {unreadCount > 0 && (
                    <Box
                      bg="#25D366"
                      color="black"
                      fontSize="xs"
                      px={2}
                      borderRadius="full"
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Flex>
              </Box>

            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
}

export default Mychats;