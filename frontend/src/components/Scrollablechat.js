import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from './Somelogic';
import { Chatstate } from '../Context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useToast, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Scrollablechat({ messages, fmsg, uploadb }) {
  const { user } = Chatstate();
  const toast = useToast();
  const [selectedmsg, setSelectedMsg] = useState([]);
  const [lastclick, setLastClick] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const msgDeleteHandler = async (msgid) => {
    try {
      const config = {
        headers: {
          "Content-type": 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      await axios.post(`${API_BASE_URL}/api/v1/message/delete`, { msgid }, config);
      fmsg();
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: 'message deletion unsuccessfully',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const clickHandler = (mid) => {
    const currTime = new Date().getTime();

    if (currTime - lastclick < 500) {
      setSelectedMsg([...selectedmsg, mid]);
    }

    if (currTime - lastclick > 700) {
      if (selectedmsg.includes(mid)) {
        setSelectedMsg(selectedmsg.filter((e) => e !== mid));
      }
    }

    setLastClick(currTime);
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div
            key={m._id}
            style={{
              display: "flex",
              backgroundColor: selectedmsg.includes(m._id) ? 'gray' : 'black'
            }}
            onClick={() => clickHandler(m._id)}
          >
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender?.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender?.name}
                    src={m.sender?.pic}
                  />
                </Tooltip>
              )}

            {/* TEXT MESSAGE */}
            {m.content ? (
              <span
                style={{
                  backgroundColor:
                    m.sender?._id === user._id ? " #60ba60" : "#2a2438",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  cursor: 'pointer'
                }}
              >
                {m.content}

                {/* ✅ TICKS */}
                {m.sender?._id === user._id && (
                  <span style={{ fontSize: "10px", marginLeft: "5px" }}>
                    {m.status === "sent" && "✓"}
                    {m.status === "delivered" && "✓✓"}
                    {m.status === "seen" && (
                      <span style={{ color: "blue" }}>✓✓</span>
                    )}
                  </span>
                )}
              </span>
            ) : (
              /* IMAGE MESSAGE */
              <div
                style={{
                  display: 'flex',
                  justifyContent: m.sender?._id === user._id ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div style={{ maxWidth: '75%' }}>
                  <img
                    src={m.msgimage}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '10px',
                      marginTop: '10px',
                      cursor: 'pointer'
                    }}
                    alt="uploaded image"
                  />

                  {/* ✅ TICKS FOR IMAGE */}
                  {m.sender?._id === user._id && (
                    <span style={{ fontSize: "10px", marginLeft: "5px" }}>
                      {m.status === "sent" && "✓"}
                      {m.status === "delivered" && "✓✓"}
                      {m.status === "seen" && (
                        <span style={{ color: "blue" }}>✓✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

      {uploadb && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3px' }}>
          <Spinner size="lg" />
        </div>
      )}

      {selectedmsg.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FontAwesomeIcon
            size="2x"
            cursor="pointer"
            icon={faTrash}
            onClick={() => msgDeleteHandler(selectedmsg)}
          />
        </div>
      )}

      <div ref={messagesEndRef} />
    </ScrollableFeed>
  );
}

export default Scrollablechat;