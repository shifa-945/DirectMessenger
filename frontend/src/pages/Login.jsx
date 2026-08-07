import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsChatDotsFill } from "react-icons/bs";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;


    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }


    try {

      setLoading(true);


      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          username,
          password,
        }
      );


      
      console.log("API Response:", response.data);
console.log("Token:", response.data.token);
console.log("Username:", response.data.username);
console.log("User ID:", response.data.user_id);


     // Save token
localStorage.setItem(
    "token",
    response.data.token
);

// Save username
localStorage.setItem(
    "username",
    response.data.username
);

// Save user id  <-- ADD THIS
localStorage.setItem(
    "user_id",
    response.data.user_id
);

      // Redirect to dashboard
      navigate("/home");


    } catch (error) {

      if (error.response) {

        setError(
          error.response.data.error || 
          "Invalid username or password."
        );

      } else {

        setError(
          "Server error. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">


      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">


        <div className="text-center mb-8">


          <div className="flex justify-center items-center gap-3 mb-3">

            <div className="bg-indigo-600 p-3 rounded-full shadow-lg">

              <BsChatDotsFill 
                className="text-white text-3xl" 
              />

            </div>


            <h1 className="text-4xl font-bold text-indigo-700">
              Direct Messenger
            </h1>

          </div>


          <p className="text-gray-500">
            Welcome back! Login to continue chatting.
          </p>


        </div>



        {error && (

          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">

            {error}

          </div>

        )}



        <form 
          onSubmit={handleSubmit} 
          className="space-y-5"
        >


          <div>

            <label className="block mb-2 font-medium">
              Username
            </label>


            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />


          </div>



          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>


            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />


          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-300"
          >

            {loading ? "Logging in..." : "Login"}

          </button>


        </form>




        <div className="text-center mt-6">

          <span className="text-gray-500">
            Don't have an account?
          </span>


          <Link
            to="/"
            className="text-indigo-600 font-semibold ml-2 hover:underline"
          >
            Register
          </Link>


        </div>


      </div>


    </div>
  );
}


export default Login;