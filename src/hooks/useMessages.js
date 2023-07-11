import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [newMessage, setNewMessage] = useState((null));
  useEffect(() => {
    setMessageLoading(true)
    let baseUrl = process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:3002' : 'https://slackapi.uttamsdarji.online';
    axios.get(`${baseUrl}/get-messages`).then((response) => {
      if (response?.data?.length > 0) {
        setMessages(response.data);
      }
      setMessageLoading(false)
    }).catch(() => {
      setMessageLoading(false)
    })
    let wssUrl = process.env.NODE_ENV == 'development' ? 'ws://localhost:3003' : 'wss://slackapi.uttamsdarji.online:3003';
    let socket = new WebSocket(wssUrl);
    socket.onopen = function(e) {
      console.log("connection established")
    }
    socket.onclose = function(e) {
      console.log("connection closed")
    }
    socket.onerror = function(e) {
      console.log("connection error",e)
    }
    socket.onmessage = function (event) {
      let data = event?.data ? JSON.parse(event.data) : {};
      if (data?.message?.event?.type && data.message.event.type == 'message') {
        addNewMessage(data.message.event)
      }
    }
  }, [])
  useEffect(() => {
    if (newMessage) {
      setMessages([newMessage, ...messages]);
      setNewMessage(null);
    }
  }, [newMessage])
  const addNewMessage = (msg) => {
    setNewMessage(msg);
  }
  const publishMessage = (text) => {
    setPublishLoading(true);
    let baseUrl = process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:3002' : 'https://slackapi.uttamsdarji.online';
    axios.post(`${baseUrl}/publish-message`, { text }).then((response) => {
      setPublishLoading(false)
    }).catch(() => {
      setPublishLoading(false)
    })
  }
  return {messages,addNewMessage,publishMessage,messageLoading,publishLoading};
}

export default useMessages;