import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Input,
  useToast,
  FormControl,
  Tag,
  TagLabel,
  Box,
  TagCloseButton,
} from "@chakra-ui/react";
import { Chatstate } from "../Context/Context";
import axios from "axios";
import UserListItem from "./UserListItem";
import { API_BASE_URL } from "../config";

function Groupchatmodal() {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [chatName, setchatName] = useState("");
  const [search, setsearch] = useState("");
  const [selectedUser, setselectedUser] = useState([]);
  const [searchResult, setsearchResult] = useState([]);
  const [Loading, setloading] = useState(false);
  const [createloading, setcreateloading] = useState(false);

  const { user, chats, setChats } = Chatstate();
  const toast = useToast();

  // 🔹 SEARCH USER
  const Searchuser = async (value) => {
    setsearch(value);

    if (!value.trim()) return;

    try {
      setloading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `${API_BASE_URL}/api/v1/users?search=${encodeURIComponent(value)}`,
        config
      );

      setsearchResult(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Search failed",
        status: "error",
      });
    }

    setloading(false);
  };

  // 🔹 SELECT USER
  const selectinguser = (selcuser) => {
    if (selectedUser.find((u) => u._id === selcuser._id)) return;
    setselectedUser([...selectedUser, selcuser]);
  };

  // 🔹 CREATE GROUP
  const Creategroup = async () => {
    if (!chatName || selectedUser.length < 2) {
      toast({
        title: "Error",
        description: "Enter name & select at least 2 users",
        status: "warning",
      });
      return;
    }

    try {
      setcreateloading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const userIds = selectedUser.map((u) => u._id);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/v1/chat/group`,
        {
          name: chatName,
          users: JSON.stringify(userIds),
        },
        config
      );

      setChats([data, ...chats]);
      onClose();

      setselectedUser([]);
      setsearchResult([]);
      setchatName("");

    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed",
        status: "error",
      });
    }

    setcreateloading(false);
  };

  return (
    <>
      <Button onClick={onOpen}>New Group Chat</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group Chat</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl mb={3}>
              <Input
                placeholder="Chat Name"
                value={chatName}
                onChange={(e) => setchatName(e.target.value)}
              />
            </FormControl>

            <FormControl mb={3}>
              <Input
                placeholder="Search Users"
                value={search}
                onChange={(e) => Searchuser(e.target.value)}
              />
            </FormControl>

            <Box display="flex" flexWrap="wrap">
              {selectedUser.map((u) => (
                <Tag key={u._id} m={1}>
                  <TagLabel>{u.name}</TagLabel>
                  <TagCloseButton
                    onClick={() =>
                      setselectedUser(
                        selectedUser.filter((s) => s._id !== u._id)
                      )
                    }
                  />
                </Tag>
              ))}
            </Box>

            {Loading
              ? "Loading..."
              : searchResult.slice(0, 4).map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => selectinguser(u)}
                  />
                ))}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={Creategroup}
              isLoading={createloading}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Groupchatmodal;