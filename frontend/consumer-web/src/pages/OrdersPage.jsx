import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { orderAPI } from '../services/api';

const statusLabels = {
  pending: '주문접수',
  confirmed: '조리중',
  preparing: '배달준비',
  delivering: '배달중',
  delivered: '배달완료',
  cancelled: '취소됨',
};

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  delivering: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (err) {
      setError('주문 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        주문 내역
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary" gutterBottom>
            주문 내역이 없습니다.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            음식점 보러가기
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{order.store_name}</Typography>
                  <Chip
                    label={statusLabels[order.status] || order.status}
                    color={statusColors[order.status] || 'default'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  주문번호: #{order.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  주문시간: {new Date(order.created_at).toLocaleString('ko-KR')}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  {order.total_amount?.toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
