import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./Inbox.css";

function Inbox() {
  const [messages, setMessages] = useState([]);

  function getInbox() {
    fetch("http://localhost:3001/inbox")
      .then((response) => response.json())
      .then((data) => {
        const sortedMessages = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMessages(sortedMessages);
      })
      .catch((error) => {
        console.error("Error fetching inbox:", error);
      });
  }

  function handleMessageClick(message) {
    fetch("http://localhost:3001/setUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: message.userName,
        receiverId: message.receiverName,
      }),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/Messages";
        } else {
          throw new Error("Failed to send message");
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  }

  useEffect(() => {
    getInbox();
  }, []);

  return (
    <>
      <Navbar />
      <div className="inboxpage">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className="message-item" onClick={() => handleMessageClick(msg)}>
              <p className="Sent">Sent From: {msg.userName}</p>
              <p className="Sent">Sent To: {msg.receiverName}</p>
              <p>{msg.message}</p>
              <p>{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Inbox;
