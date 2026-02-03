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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { storesAPI } from '../services/api';

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
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
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      setStores(response.data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const handleOpenDialog = (store = null) => {
    if (store) {
      setEditingStore(store);
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
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        address: '',
        phone: '',
        opening_hours: '',
        delivery_fee: 0,
        min_order_amount: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStore(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingStore) {
        await storesAPI.updateStore(editingStore.id, formData);
      } else {
        await storesAPI.createStore(formData);
      }
      handleCloseDialog();
      loadStores();
    } catch (error) {
      console.error('Failed to save store:', error);
      alert(error.response?.data?.detail || '저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await storesAPI.deleteStore(id);
      loadStores();
    } catch (error) {
      console.error('Failed to delete store:', error);
      alert('삭제에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          가게 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          가게 추가
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} md={6} key={store.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{store.name}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(store)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(store.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {store.description}
                </Typography>

                <Box sx={{ mb: 1 }}>
                  <Chip label={store.category || '미분류'} size="small" sx={{ mr: 1 }} />
                  <Chip
                    label={store.is_active ? '영업중' : '휴업'}
                    size="small"
                    color={store.is_active ? 'success' : 'default'}
                  />
                </Box>

                <Typography variant="body2" sx={{ mt: 2 }}>
                  📍 {store.address}
                </Typography>
                <Typography variant="body2">
                  📞 {store.phone || '-'}
                </Typography>
                <Typography variant="body2">
                  🏍️ 배달비: ₩{store.delivery_fee.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  💰 최소주문: ₩{store.min_order_amount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  ⭐ 평점: {store.rating.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {stores.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            등록된 가게가 없습니다
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStore ? '가게 수정' : '가게 추가'}
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
