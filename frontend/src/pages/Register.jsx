import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


function Register() {

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");

  };




  const handleSubmit = async (e) => {

    e.preventDefault();


    const { username, email, password, confirmPassword } = formData;



    if (!username || !email || !password || !confirmPassword) {

      setError("Please fill in all fields.");
      return;

    }



    if (password !== confirmPassword) {

      setError("Passwords do not match.");
      return;

    }




    try {


      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          username: username,
          email: email,
          password: password
        }
      );


      console.log(response.data);


      setSuccess("Registration successful!");


      setFormData({

        username: "",
        email: "",
        password: "",
        confirmPassword: ""

      });



    } catch (error) {


      console.log(error.response);


      setError("Registration failed. Try again.");

    }


  };





  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">


      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">



        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-indigo-700">
            Direct Messenger
          </h1>


          <p className="text-gray-500 mt-2">
            Create your account to start chatting.
          </p>

        </div>





        {error && (

          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">

            {error}

          </div>

        )}




        {success && (

          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-lg mb-4">

            {success}

          </div>

        )}







        <form onSubmit={handleSubmit} className="space-y-5">



          <div>

            <label className="block mb-2 font-medium">
              Username
            </label>


            <input

              type="text"

              name="username"

              placeholder="Enter username"

              value={formData.username}

              onChange={handleChange}

              className="w-full border rounded-lg px-4 py-3"

            />


          </div>





          <div>


            <label className="block mb-2 font-medium">
              Email
            </label>


            <input

              type="email"

              name="email"

              placeholder="Enter email"

              value={formData.email}

              onChange={handleChange}

              className="w-full border rounded-lg px-4 py-3"

            />


          </div>






          <div>


            <label className="block mb-2 font-medium">
              Password
            </label>


            <input

              type="password"

              name="password"

              placeholder="Enter password"

              value={formData.password}

              onChange={handleChange}

              className="w-full border rounded-lg px-4 py-3"

            />


          </div>






          <div>


            <label className="block mb-2 font-medium">
              Confirm Password
            </label>


            <input

              type="password"

              name="confirmPassword"

              placeholder="Confirm password"

              value={formData.confirmPassword}

              onChange={handleChange}

              className="w-full border rounded-lg px-4 py-3"

            />


          </div>







          <button

            type="submit"

            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"

          >

            Register

          </button>




        </form>






        <div className="text-center mt-6">


          <span className="text-gray-500">

            Already have an account?

          </span>




          <Link

            to="/login"

            className="text-indigo-600 font-semibold ml-2 hover:underline"

          >

            Login

          </Link>



        </div>




      </div>


    </div>

  );

}



export default Register;