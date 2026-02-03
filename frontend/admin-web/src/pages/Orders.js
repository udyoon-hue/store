import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Divider,
} from '@mui/material';
import { ordersAPI, storesAPI } from '../services/api';

const ORDER_STATUS_MAP = {
  pending: { label: '주문 접수', color: 'warning' },
  confirmed: { label: '상점 확인', color: 'info' },
  preparing: { label: '조리중', color: 'info' },
  ready: { label: '준비 완료', color: 'secondary' },
  delivering: { label: '배달중', color: 'primary' },
  completed: { label: '완료', color: 'success' },
  cancelled: { label: '취소', color: 'error' },
};

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'cancelled'],
  delivering: ['completed'],
  completed: [],
  cancelled: [],
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadOrders();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
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

  const loadOrders = async () => {
    try {
      const params = selectedStore ? { store_id: selectedStore } : {};
      const response = await ordersAPI.getOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    try {
      await ordersAPI.updateOrderStatus(selectedOrder.id, newStatus);
      handleCloseDialog();
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('상태 업데이트에 실패했습니다');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        주문 관리
      </Typography>

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
                  <TableCell>주문번호</TableCell>
                  <TableCell>고객</TableCell>
                  <TableCell>주문일시</TableCell>
                  <TableCell>금액</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="right">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                  return (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.delivery_phone}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.delivery_address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        ₩{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDialog(order)}
                        >
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {orders.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                주문이 없습니다
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
        {selectedOrder && (
          <>
            <DialogTitle>주문 상세 #{selectedOrder.id}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  주문일시
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedOrder.created_at).toLocaleString('ko-KR')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  배달 정보
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.delivery_address}
                </Typography>
                <Typography variant="body2">
                  {selectedOrder.delivery_phone}
                </Typography>
              </Box>

              {selectedOrder.special_requests && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    요청사항
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.special_requests}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                주문 상품
              </Typography>
              {selectedOrder.order_items?.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                  }}
                >
                  <Typography variant="body2">
                    {item.product?.name || `상품 #${item.product_id}`} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ₩{item.subtotal.toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">상품 금액</Typography>
                <Typography variant="body2">
                  ₩{selectedOrder.subtotal.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">배달비</Typography>
                <Typography variant="body2">
                  ₩{selectedOrder.delivery_fee.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">총 금액</Typography>
                <Typography variant="h6" color="primary">
                  ₩{selectedOrder.total_amount.toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <TextField
                select
                fullWidth
                label="주문 상태"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                margin="normal"
              >
                {STATUS_TRANSITIONS[selectedOrder.status]?.map((status) => (
                  <MenuItem key={status} value={status}>
                    {ORDER_STATUS_MAP[status].label}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>닫기</Button>
              {newStatus !== selectedOrder.status && (
                <Button onClick={handleUpdateStatus} variant="contained">
                  상태 업데이트
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
