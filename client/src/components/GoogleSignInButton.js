import React, { useEffect, useState } from 'react';
import { useJwt } from "react-jwt";
import axios from 'axios';

const GoogleSignInButton = ({ setUser }) => {
    //const [token, setToken] = useState(null);
    const [state, setState] = useState({
      token:'',
      userID: '',
      userEmail: ''
    })
    const { decodedToken, isExpired } = useJwt(state.token);

    const handleCredentialResponse = (response) => {
      console.log("Encoded JWT ID token: " + response.credential);
      setState({...state, token: response.credential});
    };

    const throwUserBack=async()=>{

      try {
        await axios.get(`http://localhost:6000/user/${handleCredentialResponse.sub}`)
          .then(response => {
            return response.data;
          })
          .catch(async(error) => {
            if (error.response.status === 404) {
              const user = {
                id: handleCredentialResponse.sub,
                email: handleCredentialResponse.email,
                firstName: handleCredentialResponse.given_name,
                lastName: handleCredentialResponse.family_name
              }

              await axios.post(`http://localhost:6000/user/add`, { user })
                .then(response => {
                  return response.data
                })
                .catch(error => {
                  console.log(error)
                })
            }
          })
      } catch (error) {
        console.log(error)
      }

    }

    useEffect(() => {
      setUser(decodedToken);
    }, [decodedToken]);

    useEffect(() => {
      const initGoogleSignIn = () => {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("buttonDiv"),
          { theme: "outline", size: "large" }  // customization attributes
        );
        window.google.accounts.id.prompt(); // also display the One Tap dialog
        console.log(handleCredentialResponse);
        throwUserBack();
      };

      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        // Load the Google Sign-In API script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = initGoogleSignIn;
        document.body.appendChild(script);
      } else {
        initGoogleSignIn();
      }
    }, []); // Empty dependency array to run the effect only once on mount

    return (
      <div id="buttonDiv"></div>
    );
  }

  export default GoogleSignInButton;
