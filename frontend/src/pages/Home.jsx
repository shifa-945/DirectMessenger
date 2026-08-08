import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [message, setMessage] = useState("");

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access");
 const userId = Number(localStorage.getItem("user_id"));
console.log("Current User ID:", userId);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  // NEW
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
useEffect(() => {
    if (!token) {
        console.log("❌ No token found");
        return;
    }

    console.log("✅ Token exists:", token);

    axios.get(
        "http://127.0.0.1:8000/api/auth/users/",
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    )
    .then((res) => {
        console.log("✅ Users API response:", res.data);
        setUsers(res.data);
    })
    .catch((err) => {
        console.log("❌ Users API error");
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
    });

}, [token]);

useEffect(() => {
    if (!chatId) return;

    console.log("Loading previous messages for chat:", chatId);

    loadMessages(chatId);
}, [chatId]);


useEffect(() => {
    if (!chatId) return;

    const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${chatId}/?user_id=${userId}`
    );

    ws.onopen = () => {
        console.log("✅ WebSocket Connected");
        setSocket(ws);
    };

    ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // TYPING STATUS
    if (data.type === "typing") {

        if (Number(data.sender) !== userId) {
            setIsTyping(data.is_typing);
            setTypingUser(data.sender_name);
        }

        return;
    }

    // EXISTING MESSAGE CODE
    setMessages((prev) => [
        ...prev,
        {
            message: data.message,
            sender: data.sender,
        },
    ]);
};

    ws.onerror = (e) => {
        console.log("WebSocket Error", e);
    };

    ws.onclose = (e) => {
        console.log("Closed", e.code, e.reason);
    };

    return () => {
        ws.close();
    };
}, [chatId, userId]);

useEffect(() => {
    if (!userId) return;

    const notificationSocket = new WebSocket(
        `ws://127.0.0.1:8000/ws/notifications/${userId}/`
    );

    notificationSocket.onopen = () => {
        console.log("🔔 Notification WebSocket Connected");
    };

    notificationSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("🔔 New Notification:", data);

        alert(`New message from ${data.sender_name}: ${data.message}`);
    };

    notificationSocket.onerror = (error) => {
        console.log("Notification WebSocket Error:", error);
    };

    notificationSocket.onclose = () => {
        console.log("Notification WebSocket Closed");
    };

    return () => {
        notificationSocket.close();
    };
}, [userId]);

  console.log(localStorage.getItem("access"));
const createOrGetChat = async (receiverId) => {
    try {
        const res = await axios.post(
            "http://127.0.0.1:8000/api/auth/chats/",
            {
                user2: receiverId,
            },
            {
                headers: {
                   Authorization: `Bearer ${token}`
                },
            }
        );

        console.log("Chat API Response:", res.data);

    setChatId(res.data.id);


    } catch (err) {
        console.log("Status:", err.response?.status);
        console.log("Data:", JSON.stringify(err.response?.data, null, 2));
        console.log(err);
    }
};
const sendMessage = () => {
    console.log("Button clicked");

    if (!socket) {
        console.log("Socket is null");
        return;
    }

    console.log("Socket state:", socket.readyState);

    if (socket.readyState !== WebSocket.OPEN) {
        console.log("Socket is not open");
        return;
    }

    // Stop typing indicator
    socket.send(
        JSON.stringify({
            type: "typing",
            is_typing: false
        })
    );

    console.log("Sending:", message);

    socket.send(
        JSON.stringify({
            message: message
        })
    );

    setMessage("");
};
const loadMessages = async (chatId) => {

    try {

        const res = await axios.get(
            `http://127.0.0.1:8000/api/auth/messages/?chat=${chatId}`,
            {
                headers:{
                   Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("Messages from API:", res.data);

        setMessages(res.data);

    }
    catch(err){
        console.log(err);
    }
}

  return (
    <div className="h-screen bg-gray-100 flex">

      {/* Sidebar */}

      <div className="w-80 bg-white shadow-lg p-5">

        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-2xl font-bold text-indigo-600">
              {username}
            </h1>

            <p className="text-gray-500 mt-2">
              Select a user from the left to start chatting.
            </p>
          </div>

          <Link to="/login" className="text-red-500">
            Logout
          </Link>

        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="w-full border rounded-lg p-3 mb-5"
        />

        <h2 className="text-xl font-bold text-gray-700 mb-3">
          Select a chat
        </h2>

        {users.map((user) => (
          <div
            key={user.id}
           onClick={() => {
    setSelectedUser(user);
    createOrGetChat(user.id);
}}
            className={`p-3 rounded-lg cursor-pointer mb-2 ${
              selectedUser?.id === user.id
                ? "bg-indigo-100"
                : "hover:bg-gray-100"
            }`}
          >
            <h3 className="font-semibold">
              {user.username}
            </h3>

            <p className="text-sm text-gray-500">
              Click to chat
            </p>
          </div>
        ))}

      </div>

      {/* Chat Area */}

      <div className="flex-1 flex flex-col">

        {/* Header */}

        <div className="bg-white shadow p-5">

          <h2 className="text-xl font-bold">
            {selectedUser ? selectedUser.username : "Select a chat"}
          </h2>

          <p className="text-green-500 text-sm">
    {selectedUser ? "Online" : ""}
</p>

{isTyping && (
    <p className="text-gray-500 text-sm">
        {typingUser} is typing...
    </p>
)}

</div>

{/* Messages */}

        {/* Messages */}

     {/* Messages */}

<div className="flex-1 p-5 overflow-y-auto">

  {selectedUser === null ? (

    <div className="flex justify-center items-center h-full">
      <p className="text-gray-500 text-lg">
        👋 Start chatting by selecting a user.
      </p>
    </div>

  ) : messages.length === 0 ? (

    <div className="flex justify-center items-center h-full">
      <p className="text-gray-500 text-lg">
        No messages yet. Say Hello 👋
      </p>
    </div>

  ) : (

    messages.map((msg, index) => {

      console.log("Message Object:", msg);
      console.log("Sender ID:", msg.sender);
      console.log("My ID:", userId);

      const isMine = Number(msg.sender) === userId;

      console.log("Is Mine:", isMine);

      return (
        <div
          key={index}
          className={`flex mb-4 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >

          <span
            className={`px-4 py-2 rounded-xl ${
              isMine
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.message}
          </span>

        </div>
      );

    })

  )}

</div>



        {/* Input */}

        <div className="bg-white p-4 flex gap-3">

          <input
            type="text"
            value={message}
           onChange={(e) => {
    setMessage(e.target.value);

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
            JSON.stringify({
                type: "typing",
                is_typing: e.target.value.length > 0
            })
        );
    }
}}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg p-3"
            disabled={!selectedUser}
          />

          <button
            onClick={sendMessage}
            disabled={!selectedUser}
            className="bg-indigo-600 text-white px-6 rounded-lg disabled:bg-gray-400"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default Home;