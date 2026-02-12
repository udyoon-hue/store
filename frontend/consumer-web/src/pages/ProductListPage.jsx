import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  Search,
  Restaurant,
  LocalDining,
  RiceBowl,
  Fastfood,
  LocalPizza,
  Cake,
  Coffee,
  LocalBar,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

// 음식 카테고리 데이터
const categories = [
  { id: 1, name: '전체', icon: <Restaurant sx={{ fontSize: 40 }} />, color: '#FF6B6B' },
  { id: 2, name: '한식', icon: <RiceBowl sx={{ fontSize: 40 }} />, color: '#4ECDC4' },
  { id: 3, name: '치킨·고기', icon: <LocalDining sx={{ fontSize: 40 }} />, color: '#FFB6B9' },
  { id: 4, name: '면·찜·탕', icon: <Restaurant sx={{ fontSize: 40 }} />, color: '#FFA07A' },
  { id: 5, name: '족발·야식', icon: <Fastfood sx={{ fontSize: 40 }} />, color: '#FFD93D' },
  { id: 6, name: '중식', icon: <Restaurant sx={{ fontSize: 40 }} />, color: '#6BCB77' },
  { id: 7, name: '일식', icon: <RiceBowl sx={{ fontSize: 40 }} />, color: '#FF6B9D' },
  { id: 8, name: '피자·양식', icon: <LocalPizza sx={{ fontSize: 40 }} />, color: '#C70039' },
  { id: 9, name: '도시락·분식', icon: <Fastfood sx={{ fontSize: 40 }} />, color: '#FFC93C' },
  { id: 10, name: '카페·웰빙', icon: <Coffee sx={{ fontSize: 40 }} />, color: '#A06CD5' },
  { id: 11, name: '디저트', icon: <Cake sx={{ fontSize: 40 }} />, color: '#FFB6C1' },
];

// 배너 데이터
const banners = [
  {
    id: 1,
    title: '배달K와 함께 하는\n성공의 시작',
    subtitle: '지금 바로 등록해 보세요',
    bgColor: '#FFE5D9',
  },
  {
    id: 2,
    title: '신선한 재료\n빠른 배달',
    subtitle: '30분 이내 배달 보장',
    bgColor: '#D4F1F4',
  },
];

export default function ProductListPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchText, setSearchText] = useState('');

  // 배너 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (category) => {
    // 카테고리별 상품 목록 페이지로 이동 (추후 구현)
    console.log('Selected category:', category.name);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 8 }}>
      {/* 상단 헤더 */}
      <Paper
        elevation={1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'white',
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Royal Garden
          </Typography>
          <IconButton onClick={() => navigate('/cart')}>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Paper>

      {/* 배너 슬라이더 */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {banners.map((banner, index) => (
          <Box
            key={banner.id}
            sx={{
              display: index === currentBanner ? 'block' : 'none',
              bgcolor: banner.bgColor,
              p: 4,
              minHeight: 160,
              position: 'relative',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#333',
                whiteSpace: 'pre-line',
                mb: 1,
              }}
            >
              {banner.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {banner.subtitle}
            </Typography>
          </Box>
        ))}
        {/* 배너 인디케이터 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentBanner ? '#333' : '#ccc',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 검색창 */}
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <TextField
          fullWidth
          placeholder="맛집, 배달 메뉴, 상품 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f5f5f5',
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
            #파전
          </Typography>
        </Box>
      </Box>

      {/* 음식 카테고리 그리드 */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={3} key={category.id}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: 'none',
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: '#f9f9f9',
                  },
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: `${category.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1,
                    }}
                  >
                    {React.cloneElement(category.icon, {
                      sx: { fontSize: 35, color: category.color },
                    })}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 추가 섹션 (광고, 이벤트 등) */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card
              sx={{
                bgcolor: '#FFF5E1',
                textAlign: 'center',
                p: 2,
                cursor: 'pointer',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🛒 마트·잡화
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                생필품 빠른 배달
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              sx={{
                bgcolor: '#FFE5E5',
                textAlign: 'center',
                p: 2,
                cursor: 'pointer',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                🏥 약국·병원
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                건강 관리 서비스
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
