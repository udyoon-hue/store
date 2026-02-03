import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { productsAPI, storesAPI } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    store_id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    is_available: true,
  });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadProducts();
    }
  }, [selectedStore]);

  const loadStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      setStores(response.data);
      if (response.data.length > 0) {
        setSelectedStore(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ store_id: selectedStore });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        store_id: product.store_id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || '',
        is_available: product.is_available,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        store_id: selectedStore,
        name: '',
        description: '',
        price: 0,
        category: '',
        is_available: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, formData);
      } else {
        await productsAPI.createProduct(formData);
      }
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.detail || '저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await productsAPI.deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('삭제에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          상품 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedStore}
        >
          상품 추가
        </Button>
      </Box>

      {stores.length > 0 ? (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                select
                fullWidth
                label="가게 선택"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>상품명</TableCell>
                  <TableCell>카테고리</TableCell>
                  <TableCell>가격</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="right">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="body1">{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>₩{product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.is_available ? '판매중' : '품절'}
                        size="small"
                        color={product.is_available ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {products.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                등록된 상품이 없습니다
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            먼저 가게를 등록해주세요
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? '상품 수정' : '상품 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="상품명"
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
          />
          <TextField
            fullWidth
            label="가격"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            select
            fullWidth
            label="판매 상태"
            name="is_available"
            value={formData.is_available}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value={true}>판매중</MenuItem>
            <MenuItem value={false}>품절</MenuItem>
          </TextField>
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
