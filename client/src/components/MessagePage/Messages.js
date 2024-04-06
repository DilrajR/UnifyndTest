import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar/Navbar';
import './Messages.css';
import { set } from 'mongoose';

function Messages() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const [receivername, setReceivername] = useState('');
    const messageListRef = useRef(null);

    const fetchMessages = () => {
        fetch("http://localhost:3001/message")
            .then(response => response.json())
            .then(data => {
                setMessages(data.messages);
                setUsername(data.userName);
                setReceivername(data.receiverName);
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
            });
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }


    function sendMessages() {

        if (!message.trim()) {
            alert("Message cannot be blank");
            return;
        }
        fetch("http://localhost:3001/sendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Message sent successfully")
                    fetchMessages();
                    setMessage("");
                } else if (response.status === 400) {
                    throw new Error("Cannot send message");
                }
            })
            .catch((error) => {
                alert(error.message);
            });
    }

    return (
        <>
          <Navbar />
          <div className="messagepage">
            <h1>@{receivername}</h1>
            <div className="message-list" ref={messageListRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`message-item ${msg.userName === username ? 'sent-by-user' : 'sent-by-others'}`}>
                  <div className="message-wrap">
                    <p>{msg.message}</p>
                  </div>
                  <div className="message-metadata">
                    <span> Date: {new Date(msg.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="submit-div">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message"
                type="text"
                placeholder="Type a message..."
              />
              <button onClick={sendMessages}>Send</button>
            </div>
          </div>
        </>
      );    
}

export default Messages;