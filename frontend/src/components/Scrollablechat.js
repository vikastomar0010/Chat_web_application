import React, { useEffect, useRef } from 'react';
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser
} from './Somelogic';
import { Chatstate } from '../Context/Context';
import { Spinner } from '@chakra-ui/react';

function Scrollablechat({ messages, uploadb }) {
  const { user } = Chatstate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const isSender = m.sender?._id === user._id;

          return (
            <div
              key={m._id}
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                padding: "3px 10px"
              }}
            >
              {/* AVATAR */}
              {!isSender &&
                (isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip label={m.sender?.name} placement="bottom-start">
                    <Avatar
                      mt="6px"
                      mr={2}
                      size="sm"
                      name={m.sender?.name}
                      src={m.sender?.profilePic}
                    />
                  </Tooltip>
                )}

              {/* MESSAGE BUBBLE */}
              <div
                style={{
                  backgroundColor: isSender ? "#DCF8C6" : "#202c33",
                  color: isSender ? "black" : "white",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  maxWidth: "65%",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  fontSize: "14px",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                  position: "relative"
                }}
              >
                {/* TEXT */}
                {m.content && <span>{m.content}</span>}

                {/* IMAGE */}
                {m.msgimage && (
                  <img
                    src={m.msgimage}
                    alt="img"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "10px",
                      marginTop: "5px"
                    }}
                  />
                )}

                {/* TIME + TICKS */}
                <div
                  style={{
                    fontSize: "10px",
                    textAlign: "right",
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "4px",
                    opacity: 0.8
                  }}
                >
                  {formatTime(m.createdAt)}

                  {/* TICKS */}
                  {isSender && (
                    <>
                      {m.status === "sent" && "✓"}
                      {m.status === "delivered" && "✓✓"}
                      {m.status === "seen" && (
                        <span style={{ color: "#4fc3f7" }}>✓✓</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {/* UPLOAD LOADER */}
      {uploadb && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: "10px" }}>
          <Spinner size="lg" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </ScrollableFeed>
  );
}

export default Scrollablechat;