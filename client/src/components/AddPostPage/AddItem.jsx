import { set } from 'mongoose';
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import './AddItem.css';
import Navbar from '../Navbar/Navbar';

const firebaseConfig = {
  apiKey: "AIzaSyB0ESvN7O6EwyI98AAIw-jdFRaud5qGLQQ",
  authDomain: "cps630-project-ba3eb.firebaseapp.com",
  projectId: "cps630-project-ba3eb",
  storageBucket: "cps630-project-ba3eb.appspot.com",
  messagingSenderId: "1010540454168",
  appId: "1:1010540454168:web:2ff8c42b873ef28f47fe6d",
  measurementId: "G-EQWD2H27HV"
};

firebase.initializeApp(firebaseConfig);

const weatherAPIKey = '9f6433c26012296c716edeafb0bfabd4';

function NewPost({ onAddPost }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [picture, setPicture] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [suggestedCities, setSuggestedCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cityExists = city !== '' && suggestedCities.some((suggestedCity) => suggestedCity.name === city);

    if (!cityExists) {
      alert('Please select a city from the dropdown');
      return;
    }
    const newPost = { id: Date.now(), title, content, city, price, pictureURL: picture, category };
    onAddPost(newPost);
    setTitle('');
    setContent('');
    setPicture('');
    setCategory('');
    setPrice('');
    setCity('');
    document.getElementById('file-upload').value = '';
  };

  const fetchCities = async (searchText) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${weatherAPIKey}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      const data = await response.json();
      const ontarioCities = data.filter(city => city.country === 'CA' && city.state === 'Ontario');
      setSuggestedCities(ontarioCities);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
      setSuggestedCities([]);
      setShowDropdown(false);
    }
  };

  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity);
    setShowDropdown(false);
  };

  function onAddPost(newPost) {
    fetch('http://localhost:3001/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPost)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to add post');
        }
        return res.json();
      })
      .then((data) => {
        alert('Post submitted successfully!');
      })
      .catch((error) => {
        alert(error.message);
      });
  }


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const uniqueFileName = `${file.name}-${Date.now()}`;
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(uniqueFileName);
    fileRef.put(file)
      .then(() => {
        console.log('Uploaded a file');
        return fileRef.getDownloadURL();
      })
      .then((url) => {
        console.log('URL:', url);
        setPicture(url);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  }
  return (
    <>
      <Navbar />
      <div className='addPost'>
        <form onSubmit={handleSubmit}>
          <h2>Add a New Post</h2>
          <div>
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Content:</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}></textarea>
          </div>
          <div>
            <label>City:</label>
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                fetchCities(e.target.value);
              }}
            />
            {showDropdown && suggestedCities.length > 0 && (
              <ul className="dropdown-container">
                {suggestedCities.map((city) => (
                  <li key={city.name} className="dropdown-item" onClick={() => handleSelectCity(city.name)}>
                    {city.name}, {city.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label>Price: $</label>
            <input type="number" value={price} min={0.00} step={0.01} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div>
            <label>Picture:</label>
            <input id="file-upload" type="file" accept="image/*" onChange={(e) => handleFileUpload(e)} />
          </div>
          <div>
            <label>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              <option value="Wanted">Wanted</option>
              <option value="Sale">Sale</option>
              <option value="AcademicService">Academic Service</option>
            </select>
          </div>
          <button type="submit">Add Post</button>
        </form>
      </div>
    </>
  );
}

export default NewPost;