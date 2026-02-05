import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Home,
  ShoppingCart,
  Receipt,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBottomNavValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/cart') return 1;
    if (location.pathname === '/orders') return 2;
    return 0;
  };

  return (
    <Box sx={{ pb: 8 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Food Delivery
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{user.name}님</Typography>
              <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                로그아웃
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
        <Outlet />
      </Box>

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          value={getBottomNavValue()}
          onChange={(event, newValue) => {
            switch (newValue) {
              case 0:
                navigate('/');
                break;
              case 1:
                navigate('/cart');
                break;
              case 2:
                navigate('/orders');
                break;
            }
          }}
        >
          <BottomNavigationAction label="홈" icon={<Home />} />
          <BottomNavigationAction
            label="장바구니"
            icon={
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCart />
              </Badge>
            }
          />
          <BottomNavigationAction label="주문내역" icon={<Receipt />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
