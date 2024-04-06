// PostContext.js
import { createContext, useContext, useState } from 'react';

const PostContext = createContext();

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [postId, setPostId] = useState(null);

  const setPostInfo = (id) => {
    setPostId(id);
  };

  return (
    <PostContext.Provider value={{ postId, setPostInfo }}>
      {children}
    </PostContext.Provider>
  );
};
