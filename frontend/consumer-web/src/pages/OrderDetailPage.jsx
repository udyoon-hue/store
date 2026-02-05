import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
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

const steps = ['주문접수', '조리중', '배달준비', '배달중', '배달완료'];
const statusToStep = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  delivering: 3,
  delivered: 4,
  cancelled: -1,
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
      setError('');
    } catch (err) {
      setError('주문 정보를 불러오는데 실패했습니다.');
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

  const activeStep = statusToStep[order.status];

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/orders')}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Typography variant="h4" gutterBottom>
        주문 상세
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">주문번호: #{order.id}</Typography>
          <Chip
            label={statusLabels[order.status] || order.status}
            color={statusColors[order.status] || 'default'}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          주문시간: {new Date(order.created_at).toLocaleString('ko-KR')}
        </Typography>
      </Paper>

      {order.status !== 'cancelled' && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            배달 진행 상황
          </Typography>
          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          가게 정보
        </Typography>
        <Typography variant="body1">{order.store_name}</Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          배달 정보
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>배달 주소:</strong> {order.delivery_address}
        </Typography>
        {order.delivery_request && (
          <Typography variant="body1">
            <strong>요청사항:</strong> {order.delivery_request}
          </Typography>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          주문 상품
        </Typography>
        <List>
          {order.items?.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={`${item.product_name} x ${item.quantity}`}
                  secondary={`${item.price?.toLocaleString()}원`}
                />
                <Typography>
                  {(item.price * item.quantity).toLocaleString()}원
                </Typography>
              </ListItem>
              {index < order.items.length - 1 && <Divider />}
            </React.Fragment>
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
            <Typography>{order.total_amount?.toLocaleString()}원</Typography>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={<strong>총 결제 금액</strong>} />
            <Typography variant="h6" color="primary">
              <strong>{order.total_amount?.toLocaleString()}원</strong>
            </Typography>
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}
