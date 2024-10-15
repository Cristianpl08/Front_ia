import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

//const CLIENT_ID = "116029599187-nmq5i3ijo8ojo766q9naf9d8tueduft8.apps.googleusercontent.com";
//const CLIENT_ID = "277375272976-pkvaiiom7klc9mubv2aj8lbrtroqvb7i.apps.googleusercontent.com";
const CLIENT_ID = "611668385896-jeom4mshdeqc55rh8hfs2bgi6dnka1q3.apps.googleusercontent.com"; //cristianp app
//const CLIENT_ID = "872832142091-usmr0n4tu00350vn28clr0pq0m9qic03.apps.googleusercontent.com" ;// christian app //cristianp app
const Login = ({ onLoginSuccess }) => {
  const handleLoginSuccess = (credentialResponse) => {
    console.log('Login Success: credential', credentialResponse.credential);
    
    // Aquí puedes realizar la lógica de validación con tu backend
    fetch('https://backend-ia.dicapta.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        onLoginSuccess();
      })
      .catch(error => console.error('Error:', error));
  };

  const handleLoginFailure = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div>
      <h1 style={{ marginBottom: '70px' }}>Dicapta's Tools</h1> {/* Añadido margen inferior */}
      </div>
      <div className="login-container" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '300px', margin: '0 auto'}}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <p style={{ color: '#000000' }}>
          Sign in using your <span style={{ color: '#357ae8' }}>Dicapta</span> Google account.
        </p>        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
            className="custom-google-button"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;