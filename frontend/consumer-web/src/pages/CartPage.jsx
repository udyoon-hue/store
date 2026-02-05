import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack, Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, store, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
        </Box>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            장바구니가 비어있습니다
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            음식점 보러가기
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Button
          color="error"
          startIcon={<Delete />}
          onClick={() => {
            if (window.confirm('장바구니를 비우시겠습니까?')) {
              clearCart();
              navigate('/');
            }
          }}
        >
          전체삭제
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        장바구니
      </Typography>

      {store && (
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h6">{store.name}</Typography>
        </Paper>
      )}

      <List>
        {cart.map((item) => (
          <Card key={item.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                    {item.price?.toLocaleString()}원
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="h6">
                  소계: {(item.price * item.quantity).toLocaleString()}원
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          주문 요약
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="상품 금액" />
            <Typography>{getTotal().toLocaleString()}원</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={<strong>총 결제 금액</strong>} />
            <Typography variant="h6" color="primary">
              <strong>{getTotal().toLocaleString()}원</strong>
            </Typography>
          </ListItem>
        </List>
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate('/checkout')}
        >
          주문하기
        </Button>
      </Paper>
    </Container>
  );
}
