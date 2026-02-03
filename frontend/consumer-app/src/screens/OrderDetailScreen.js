import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Chip, Divider, ProgressBar } from 'react-native-paper';
import { ordersAPI } from '../services/api';

const ORDER_STATUS_MAP = {
  pending: { label: '주문 접수', color: '#FFA500', progress: 0.2 },
  confirmed: { label: '상점 확인', color: '#4CAF50', progress: 0.4 },
  preparing: { label: '조리중', color: '#2196F3', progress: 0.6 },
  ready: { label: '준비 완료', color: '#9C27B0', progress: 0.8 },
  delivering: { label: '배달중', color: '#FF6B6B', progress: 0.9 },
  completed: { label: '완료', color: '#4CAF50', progress: 1.0 },
  cancelled: { label: '취소', color: '#F44336', progress: 0 },
};

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrder();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  if (loading || !order) {
    return <View style={styles.container} />;
  }

  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title>주문 #{order.id}</Title>
            <Chip
              style={{ backgroundColor: statusInfo.color }}
              textStyle={{ color: '#fff' }}
            >
              {statusInfo.label}
            </Chip>
          </View>
          <Text style={styles.date}>
            {new Date(order.created_at).toLocaleString('ko-KR')}
          </Text>

          <ProgressBar
            progress={statusInfo.progress}
            color={statusInfo.color}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {order.store && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>가게 정보</Title>
            <Text style={styles.storeName}>{order.store.name}</Text>
            <Text style={styles.storeAddress}>{order.store.address}</Text>
            {order.store.phone && (
              <Text style={styles.storePhone}>Tel: {order.store.phone}</Text>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>배달 정보</Title>
          <Text style={styles.infoLabel}>배달 주소</Text>
          <Text style={styles.infoValue}>{order.delivery_address}</Text>
          <Text style={styles.infoLabel}>전화번호</Text>
          <Text style={styles.infoValue}>{order.delivery_phone}</Text>
          {order.special_requests && (
            <>
              <Text style={styles.infoLabel}>요청사항</Text>
              <Text style={styles.infoValue}>{order.special_requests}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>주문 상품</Title>
          {order.order_items?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.product?.name || `상품 #${item.product_id}`} x {item.quantity}
              </Text>
              <Text>₩{item.subtotal.toLocaleString()}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>결제 정보</Title>
          <View style={styles.summaryRow}>
            <Text>상품 금액</Text>
            <Text>₩{order.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>배달비</Text>
            <Text>₩{order.delivery_fee.toLocaleString()}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Title>총 결제금액</Title>
            <Title style={styles.totalPrice}>
              ₩{order.total_amount.toLocaleString()}
            </Title>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  storePhone: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  divider: {
    marginVertical: 12,
  },
  totalPrice: {
    color: '#FF6B6B',
  },
});
