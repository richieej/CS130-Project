import React, { useEffect, useState } from 'react';
import { useJwt } from "react-jwt";

const GoogleAuthButton = ({ setUser }) => {
    const [token, setToken] = useState(null);
    const { decodedToken } = useJwt(token);

    const handleCredentialResponse = (response) => {
      setToken(response.credential);
    };

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

  export default GoogleAuthButton;
