import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { storesAPI } from '../services/api';

export default function Stores() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    opening_hours: '',
    delivery_fee: 0,
    min_order_amount: 0,
  });

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const response = await storesAPI.getMyStores();
      if (response.data && response.data.length > 0) {
        setStore(response.data[0]); // 첫 번째 가게만 사용
      }
    } catch (error) {
      console.error('Failed to load store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (store) {
      setFormData({
        name: store.name,
        description: store.description || '',
        category: store.category || '',
        address: store.address,
        phone: store.phone || '',
        opening_hours: store.opening_hours || '',
        delivery_fee: store.delivery_fee,
        min_order_amount: store.min_order_amount,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (store) {
        await storesAPI.updateStore(store.id, formData);
        setStore({ ...store, ...formData });
      }
      handleCloseDialog();
      alert('가게 정보가 저장되었습니다');
    } catch (error) {
      console.error('Failed to save store:', error);
      alert(error.response?.data?.detail || '저장에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!store) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          가게 정보를 찾을 수 없습니다. 먼저 가게를 등록해주세요.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          가게 정보
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleOpenDialog}
        >
          정보 수정
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>{store.name}</Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={store.category || '미분류'} size="small" sx={{ mr: 1 }} />
              <Chip
                label={store.is_active ? '영업중' : '휴업'}
                size="small"
                color={store.is_active ? 'success' : 'default'}
              />
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            {store.description}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📍 <strong>주소:</strong> {store.address}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📞 <strong>전화번호:</strong> {store.phone || '-'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🕐 <strong>영업시간:</strong> {store.opening_hours || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🏍️ <strong>배달비:</strong> ₩{store.delivery_fee.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                💰 <strong>최소주문금액:</strong> ₩{store.min_order_amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ⭐ <strong>평점:</strong> {store.rating.toFixed(1)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          가게 정보 수정
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="가게명"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="설명"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="카테고리"
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
            placeholder="예: 편의점, 과일, 정육"
          />
          <TextField
            fullWidth
            label="주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="전화번호"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="영업시간"
            name="opening_hours"
            value={formData.opening_hours}
            onChange={handleChange}
            margin="normal"
            placeholder="예: 09:00 - 22:00"
          />
          <TextField
            fullWidth
            label="배달비"
            name="delivery_fee"
            type="number"
            value={formData.delivery_fee}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="최소 주문 금액"
            name="min_order_amount"
            type="number"
            value={formData.min_order_amount}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
