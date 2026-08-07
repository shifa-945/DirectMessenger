import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [message, setMessage] = useState("");

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
 const userId = Number(localStorage.getItem("user_id"));
console.log("Current User ID:", userId);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatId, setChatId] = useState(null);

  // NEW
  const [selectedUser, setSelectedUser] = useState(null);
  

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/auth/users/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  console.log(localStorage.getItem("token"));
const createOrGetChat = async (receiverId) => {
    try {
        const res = await axios.post(
            "http://127.0.0.1:8000/api/auth/chats/",
            {
                user2: receiverId,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        console.log("Chat API Response:", res.data);

       setChatId(res.data.id);
loadMessages(res.data.id);

    } catch (err) {
        console.log("Status:", err.response?.status);
        console.log("Data:", JSON.stringify(err.response?.data, null, 2));
        console.log(err);
    }
};

  const sendMessage = async () => {
    console.log("Send button clicked");

    if (message === "") return;

    try {
        console.log("Chat ID:", chatId);
        console.log("Message:", message);

        await axios.post(
            "http://127.0.0.1:8000/api/auth/messages/",
            {
                chat: chatId,
                message: message,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );

        setMessage("");
        loadMessages(chatId);

    } catch (err) {
        console.log(err.response);
        console.log(err);
    }
};

const loadMessages = async (chatId) => {

    try {

        const res = await axios.get(
            `http://127.0.0.1:8000/api/auth/messages/?chat=${chatId}`,
            {
                headers:{
                    Authorization:`Token ${token}`
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

        </div>

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
            onChange={(e) => setMessage(e.target.value)}
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