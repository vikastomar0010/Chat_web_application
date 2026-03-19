import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuItem,
  MenuList,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  useDisclosure,
  DrawerBody,
  Input,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Chatstate } from "../Context/Context";
import ProfileModal from "../components/ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../components/ChatLoading";
import UserListItem from "../components/UserListItem";
import { API_BASE_URL } from "../config";

function Sidedrawer() {
  const btnref = React.useRef();

  // ✅ FIXED STATES
  const [result, setresult] = useState([]);
  const [search, setsearch] = useState(""); 
  const [loading, setloading] = useState(false);
  const [chatloading, setchatloading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const { user, setUser, setSelectedChat, chats, setChats } = Chatstate();

  // 🔹 LOGOUT
  const LogOut = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setSelectedChat(null);
    setChats([]);
    navigate("/");
  };

  // 🔹 SEARCH USER
  const SearchUser = async () => {
    if (!search || !search.trim()) {
      toast({
        title: "Please enter something to search",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setloading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${API_BASE_URL}/api/v1/users?search=${encodeURIComponent(search)}`,
        config
      );

      setresult(data);
    } catch (err) {
      toast({
        title: "Error Occurred",
        description: err.response?.data?.msg || "Search failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setloading(false);
  };

  // 🔹 ACCESS CHAT
  const accessChata = async (userId) => {
    try {
      setchatloading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/chat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      onClose();
    } catch (err) {
      toast({
        title: "Error Occurred",
        description: err.response?.data?.msg || "Failed to create chat",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setchatloading(false);
  };

  return (
    <>
      {/* 🔹 TOP BAR */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#2a2438"
        w="100%"
        p="5px 10px"
        borderRadius="lg"
      >
        <Tooltip label="Search the Users" hasArrow placement="bottom-end">
          <Button variant="ghost" ref={btnref} onClick={onOpen}>
            <FontAwesomeIcon color="white" icon={faMagnifyingGlass} />
            <Text px="4" color="white" display={{ base: "none", md: "flex" }}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          GB Chat
        </Text>

        <div style={{ display: "flex" }}>
          <Menu>
            <MenuButton>
              <BellIcon w={7} h={7} />
            </MenuButton>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" name={user.name} src={user.pic} />
            </MenuButton>

            <MenuList bg="#2a2438">
              <ProfileModal user={user}>
                <MenuItem bg="#2a2438">My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider />
              <MenuItem onClick={LogOut} bg="#2a2438">
                LogOut
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* 🔹 DRAWER */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} finalFocusRef={btnref}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search || ""} 
                onChange={(e) => setsearch(e.target.value)}
              />
              <Button onClick={SearchUser}>Go</Button>
            </Box>

            {/* 🔹 RESULTS */}
            {loading ? (
              <ChatLoading />
            ) : (
              result?.map((e) => (
                <UserListItem
                  key={e._id}
                  user={e}
                  handleFunction={() => accessChata(e._id)}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Sidedrawer;