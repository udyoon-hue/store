import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Store as StoreIcon, AccessTime } from '@mui/icons-material';
import { storeAPI } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getStores();
      setStores(response.data);
    } catch (err) {
      setError('가게 목록을 불러오는데 실패했습니다.');
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
        음식점 목록
      </Typography>
      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StoreIcon sx={{ fontSize: 80, color: 'white' }} />
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {store.category}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={`최소주문 ${store.minimum_order_amount?.toLocaleString()}원`}
                  />
                  <Chip
                    size="small"
                    icon={<AccessTime />}
                    label={`${store.delivery_time}분`}
                  />
                  <Chip
                    size="small"
                    label={`배달비 ${store.delivery_fee?.toLocaleString()}원`}
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {stores.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            등록된 음식점이 없습니다.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
