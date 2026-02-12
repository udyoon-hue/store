import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Home,
  LocalShipping,
  ShoppingCart,
  Chat,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart } = useCart();

  const handleOrdersClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/orders');
    }
  };

  const getBottomNavValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/delivery') return 1;
    if (location.pathname === '/cart') return 2;
    if (location.pathname === '/orders') return 3;
    if (location.pathname === '/mypage') return 4;
    return 0;
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Box sx={{ minHeight: '100vh', pb: 7 }}>
        <Outlet />
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
        <BottomNavigation
          value={getBottomNavValue()}
          onChange={(event, newValue) => {
            switch (newValue) {
              case 0:
                navigate('/');
                break;
              case 1:
                navigate('/delivery');
                break;
              case 2:
                navigate('/cart');
                break;
              case 3:
                handleOrdersClick();
                break;
              case 4:
                if (!user) {
                  navigate('/login');
                } else {
                  navigate('/mypage');
                }
                break;
            }
          }}
        >
          <BottomNavigationAction label="홈" icon={<Home />} />
          <BottomNavigationAction label="배달픽" icon={<LocalShipping />} />
          <BottomNavigationAction
            label="장바구니"
            icon={
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCart />
              </Badge>
            }
          />
          <BottomNavigationAction label="주문톡" icon={<Chat />} />
          <BottomNavigationAction label="내정보" icon={<Person />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
