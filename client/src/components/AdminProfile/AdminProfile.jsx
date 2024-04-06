import Navbar from "../Navbar/Navbar";
import "./AdminProfile.css";
import { useState, useEffect } from "react";
import trashLogo from "../../assets/Trash128.png";

function AdminProfile() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [userNames, setUserNames] = useState([]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    fetch("http://localhost:3001/Sale")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/Users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        const userNames = data.map((user) => user.username);
        setUserNames(userNames);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const results = items.filter(
      (item) =>
        searchQuery.trim() === "" || item.userName.toLowerCase() === searchQuery.toLowerCase()
    );
    setFilteredItems(results);
  }, [items, searchQuery]);

  const deleteUser = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/Users/${username}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("User deleted successfully");
        window.location.reload();
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user");
    }
  };

  const handleMassDelete = async (e, username) => {
    e.preventDefault();
    try {
      const posts = items.filter((item) => item.userName === username);
      for (const post in posts) {
        const postId = posts[post]._id;
        const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== postId));
        alert("Post deleted successfully");
      } else {
        alert("Failed to delete post");
      }
    }} catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the posts");
    }
    deleteUser(username);
  };

  const handleDelete = async (postId) => {
    try {
        const response = await fetch(`http://localhost:3001/posts/${postId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorMessage = await response.text(); 
            console.error(`Failed to delete post: ${errorMessage}`);
            alert("Failed to delete post");
            return;
        }
        setItems((prevItems) => prevItems.filter((item) => item.id !== postId));
        alert("Post deleted successfully");
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("An error occurred while deleting the post");
    }
};

  return (
    <>
      <Navbar />
      <div className="AdminProfile">
        <form>
          <div className="selectors">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              id="searchInput"
            />
          </div>
          {userNames.includes(searchQuery) && searchQuery.trim() !== "" && (
            <div className="delete-wrapper">
              <button className="user-delete" onClick={(e) => handleMassDelete(e, searchQuery)}>
                Delete User and Posts
              </button>
            </div>
          )}
          <div className="posts">
            {filteredItems.map((item) => (
              <div className="post" key={item._id}>
                <div className="top">
                  <div className="post-category">
                    <p className="misc-category">{item.category}</p>
                  </div>
                  <button onClick={() => handleDelete(item._id)} className="post-delete">
                    <img src={trashLogo} alt="Delete" />
                  </button>
                </div>
                <div className="post-header">
                  <img src={item.pictureURL} alt={item.title} />
                  <div className="header-misc">
                    <p className="misc-price">${item.price}</p>
                  </div>
                </div>
                <h2>{item.title}</h2>
                <div className="content">
                  <p>{item.content}</p>
                </div>
                <div className="post-footer">
                  <p className="footer-location">{item.city}</p>
                  <p className="footer-username">@{item.userName}</p>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </>
  );
}

export default AdminProfile;
