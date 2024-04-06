import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./Homepage.css";

function Homepage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [priceFilter, setPriceFilter] = useState(0);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [titleContentQuery, setTitleContentQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3001/Sale")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setFilteredItems(data);
        const maxPrice = Math.ceil(Math.max(...data.map((item) => item.price)));
        setMaxPrice(maxPrice);
        setPriceFilter(maxPrice);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handlePriceFilterChange = (e) => {
    const newPriceFilter = parseInt(e.target.value);
    setPriceFilter(newPriceFilter);
    filterItems(categoryFilters, searchQuery, titleContentQuery, newPriceFilter);
  };

  const handleCategoryFilterChange = (e) => {
    const category = e.target.value;
    let updatedCategoryFilters = [...categoryFilters];
    if (updatedCategoryFilters.includes(category)) {
      updatedCategoryFilters = updatedCategoryFilters.filter((item) => item !== category);
    } else {
      updatedCategoryFilters.push(category);
    }
    setCategoryFilters(updatedCategoryFilters);
    filterItems(updatedCategoryFilters, searchQuery, titleContentQuery, priceFilter);
  };

  const handleSearchInputChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    filterItems(categoryFilters, newSearchQuery, titleContentQuery, priceFilter);
  };

  const handleTitleContentInputChange = (e) => {
    const newTitleContentQuery = e.target.value;
    setTitleContentQuery(newTitleContentQuery);
    filterItems(categoryFilters, searchQuery, newTitleContentQuery, priceFilter);
  };

  const filterItems = (categories, search, titleContent, price) => {
    let filtered = items.filter((item) => item.price <= price);
    if (categories.length > 0) {
      filtered = filtered.filter((item) => categories.includes(item.category));
    }
    if (search) {
      filtered = filtered.filter(
        (item) => item.city && item.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (titleContent) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(titleContent.toLowerCase()) ||
          item.content.toLowerCase().includes(titleContent.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  };

  function handleMessage(postID) {
    fetch(`http://localhost:3001/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postID }),
    })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/Messages";
      } else if (response.status === 400) {
        throw new Error("Cannot message yourself");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
};

  return (
    <>
      <Navbar />
      <div className="homepage">
        <div className="filters">
          <div className="filters-category">
            <label>Category Filter:</label>
            <br />
            <input
              type="checkbox"
              id="wanted"
              name="category"
              value="Wanted"
              checked={categoryFilters.includes("Wanted")}
              onChange={handleCategoryFilterChange}
            />
            <label htmlFor="wanted">Wanted</label>
            <br />
            <input
              type="checkbox"
              id="sale"
              name="category"
              value="Sale"
              checked={categoryFilters.includes("Sale")}
              onChange={handleCategoryFilterChange}
            />
            <label htmlFor="sale">Sale</label>
            <br />
            <input
              type="checkbox"
              id="academicService"
              name="category"
              value="AcademicService"
              checked={categoryFilters.includes("AcademicService")}
              onChange={handleCategoryFilterChange}
            />
            <label htmlFor="academicService">Academic Service</label>
            <br />
          </div>
          <div className="search-bar">
            <input
              type="text"
              id="titleContentSearch"
              value={titleContentQuery}
              onChange={handleTitleContentInputChange}
              placeholder="Search..."
            />
          </div>
          <div className="filters-price">
            <label htmlFor="priceFilter">Price Filter:</label>
            <input
              type="range"
              id="priceFilter"
              name="priceFilter"
              min="0"
              max={maxPrice}
              value={priceFilter}
              onChange={handlePriceFilterChange}
            />
            <span>${priceFilter}</span>
          </div>
          <div className="filter-location">
            <input
              type="text"
              id="locationSearch"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search by Location..."
            />
          </div>
        </div>
        <div className="posts">
          {filteredItems.map((post) => (
            <div className="post" key={post._id}>
              <div className="post-category">
                <p className="misc-category">{post.category}</p>
              </div>
              <div className="post-header">
                <img
                  src={post.pictureURL}
                  alt={post.title}
                />
                <div className="header-misc">
                  <p className="misc-price">${post.price}</p>
                </div>
              </div>
              <h2>{post.title}</h2>
              <div className="content">
                <p>{post.content}</p>
              </div>
              <div className="post-footer">
                <p className="footer-location">{post.city}</p>
                <p className="footer-username">@{post.userName}</p>
                <button className="footer-btn" onClick={() => handleMessage(post._id)}>MESSAGE</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Homepage;