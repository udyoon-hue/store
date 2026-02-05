import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
} from '@mui/icons-material';
import { storeAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

export default function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const [storeRes, productsRes] = await Promise.all([
        storeAPI.getStore(id),
        storeAPI.getStoreProducts(id),
      ]);
      setStore(storeRes.data);
      setProducts(productsRes.data);

      const initialQuantities = {};
      productsRes.data.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      setError('가게 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addToCart({ ...product, store_id: store.id, store_name: store.name }, quantity);
    alert('장바구니에 추가되었습니다!');
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
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {store.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {store.category}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`최소주문 ${store.minimum_order_amount?.toLocaleString()}원`} />
          <Chip label={`배달시간 ${store.delivery_time}분`} />
          <Chip label={`배달비 ${store.delivery_fee?.toLocaleString()}원`} color="primary" />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">메뉴</Typography>
        {cart.length > 0 && (
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/cart')}
          >
            장바구니 ({cart.length})
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} key={product.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      {product.price?.toLocaleString()}원
                    </Typography>
                    {!product.is_available && (
                      <Chip label="품절" color="error" size="small" sx={{ mt: 1 }} />
                    )}
                  </Box>
                  {product.is_available && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(product.id, -1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: '30px', textAlign: 'center' }}>
                          {quantities[product.id] || 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(product.id, 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddToCart(product)}
                        fullWidth
                      >
                        담기
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            등록된 메뉴가 없습니다.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
