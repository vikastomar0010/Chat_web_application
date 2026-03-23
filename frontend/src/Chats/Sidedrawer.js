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
  Flex
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
    if (!search || !search.trim()) return;

    try {
      setloading(true);

      const config = {
        headers: {
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
        title: "Search failed",
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
        title: "Chat error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setchatloading(false);
  };

  return (
    <>
      {/* 🔥 WHATSAPP TOP BAR */}
      <Box
        bg="#202c33"
        w="100%"
        px={3}
        py={2}
        borderBottom="1px solid #2a3942"
      >
        <Flex justify="space-between" align="center">

          {/* 🔍 SEARCH ICON ONLY */}
          <Tooltip label="Search users" hasArrow>
            <Button
              variant="ghost"
              onClick={onOpen}
              _hover={{ bg: "#2a3942" }}
            >
              <FontAwesomeIcon color="white" icon={faMagnifyingGlass} />
            </Button>
          </Tooltip>

          {/* TITLE */}
          <Text color="white" fontSize="lg" fontWeight="bold">
            Chat App
          </Text>

          {/* RIGHT SIDE */}
          <Flex align="center" gap={2}>
            <BellIcon w={5} h={5} color="white" />

            <Menu>
              <MenuButton>
                <Avatar size="sm" name={user.name} src={user.pic} />
              </MenuButton>

              <MenuList bg="#202c33" color="white">
                <ProfileModal user={user}>
                  <MenuItem bg="#202c33">My Profile</MenuItem>
                </ProfileModal>

                <MenuDivider />

                <MenuItem onClick={LogOut} bg="#202c33">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

        </Flex>
      </Box>

      {/* 🔍 SEARCH DRAWER */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="#111b21" color="white">
          <DrawerHeader borderBottomWidth="1px">
            Search Users
          </DrawerHeader>

          <DrawerBody>
            <Flex pb={2}>
              <Input
                placeholder="Search users"
                bg="#202c33"
                border="none"
                value={search}
                onChange={(e) => setsearch(e.target.value)}
              />
              <Button ml={2} onClick={SearchUser}>
                Go
              </Button>
            </Flex>

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