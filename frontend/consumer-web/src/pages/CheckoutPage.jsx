import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, store, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      setError('배달 주소를 입력해주세요.');
      return;
    }

    if (cart.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        store_id: store.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        delivery_address: deliveryAddress,
        delivery_request: deliveryRequest || null,
      };

      const response = await orderAPI.createOrder(orderData);
      clearCart();
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || '주문에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">장바구니가 비어있습니다.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          음식점 보러가기
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/cart')}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Typography variant="h4" gutterBottom>
        주문하기
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          배달 정보
        </Typography>
        <TextField
          fullWidth
          label="배달 주소"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="배달 요청사항"
          value={deliveryRequest}
          onChange={(e) => setDeliveryRequest(e.target.value)}
          multiline
          rows={3}
          placeholder="예: 문 앞에 놓아주세요"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          주문 상품 ({store?.name})
        </Typography>
        <List>
          {cart.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.name} x ${item.quantity}`}
                secondary={`${item.price?.toLocaleString()}원`}
              />
              <Typography>
                {(item.price * item.quantity).toLocaleString()}원
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          결제 금액
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
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '주문 중...' : `${getTotal().toLocaleString()}원 결제하기`}
        </Button>
      </Paper>
    </Container>
  );
}
