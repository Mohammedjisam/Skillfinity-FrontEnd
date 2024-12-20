import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../AxiosConfig';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const CartContext = createContext();
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const userDatas = useSelector((store) => store.user.userDatas);

  const updateCartCount = async () => {
    try {
      const response = await axiosInstance.post(`/user/data/cartcount/${userDatas._id}`);
      setCartCount(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const incrementCartCount = () => {
    setCartCount((prevCount) => prevCount + 1);
  };

  const decrementCartCount = () => {
    setCartCount((prevCount) => Math.max(0, prevCount - 1));
  };

  useEffect(() => {
    if (userDatas?._id) {
      updateCartCount();
    }
  }, [userDatas?._id,location.pathname]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        updateCartCount,
        incrementCartCount,
        decrementCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};