import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SOCKET_ENDPOINT } from "../config";

let socket;

const UserListItem = ({ handleFunction, user }) => {

  const [isOnline, setIsOnline] = useState(user.isOnline);
  const [lastSeen, setLastSeen] = useState(user.lastSeen);

  useEffect(() => {
    socket = io(SOCKET_ENDPOINT);

    // ✅ listen online
    socket.on("user online", (userId) => {
      if (userId === user._id) {
        setIsOnline(true);
      }
    });

    // ✅ listen offline
    socket.on("user offline", (userId) => {
      if (userId === user._id) {
        setIsOnline(false);
        setLastSeen(new Date());
      }
    });

    return () => {
      socket.disconnect();
    };

  }, [user._id]);

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />

      <Box>
        <Text>{user.name}</Text>

        {/* ✅ ONLINE / LAST SEEN */}
        {isOnline ? (
          <Text fontSize="xs" color="green.500">
            ● Online
          </Text>
        ) : (
          <Text fontSize="xs" color="gray.500">
            Last seen: {lastSeen ? new Date(lastSeen).toLocaleString() : "Offline"}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default UserListItem;