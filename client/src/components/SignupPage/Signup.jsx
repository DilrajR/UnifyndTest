import { set } from 'mongoose';
import React, { useEffect, useState } from 'react';
import logo from '../../assets/tmu_logo.svg';
import './Signup.css';

function Signup({ onAddUser }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), firstName, lastName, username, email, password };
    onAddUser(newUser);
    setFirstName('');
    setLastName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  function onAddUser(newUser) {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      alert('Passwords do not match');
    } else {
      fetch('http://localhost:3001/Users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error);
            });
          }
          return res.json();
        })
        .then((data) => {
          alert('User added successfully!');
          window.location.href = '/';
        })
        .catch((error) => {
          console.error('Error adding user:', error);
          alert(error.message); // Alert the error message received from the server
        });
    }
  }

  return (
    <>
      <div className="signup-component main-wrap1">
        <main className="signup">
          <div className="img-wrap">
            <img className="" src={logo} alt="TMU Logo" width={100} height={100} />
          </div>
          <h1 className="sitename">UniFynd</h1>
          <form onSubmit={handleSubmit} className="signup">
            {/* name w/ first and last being side-to-side*/}
            <div className="names">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="name firstName"
                type="text"
                placeholder="First Name"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="name lastName"
                type="text"
                placeholder="Last Name"
              />
            </div>
            {/* email */}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username"
              type="text"
              placeholder="Username"
            />
            {/* email */}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email"
              type="email"
              placeholder="Email"
            />
            {/* password */}
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password"
              type="password"
              placeholder="Password"
            />
            {/* confirm password */}
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="confirm-password"
              type="password"
              placeholder="Confirm Password"
            />
            {/* signup button */}
            <button className="signup-btn">Sign Up</button>
          </form>
        </main>
      </div>
    </>
  );
}

export default Signup;
