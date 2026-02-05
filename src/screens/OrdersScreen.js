import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';
import { ordersAPI } from '../services/api';

const ORDER_STATUS_MAP = {
  pending: { label: '주문 접수', color: '#FFA500' },
  confirmed: { label: '상점 확인', color: '#4CAF50' },
  preparing: { label: '조리중', color: '#2196F3' },
  ready: { label: '준비 완료', color: '#9C27B0' },
  delivering: { label: '배달중', color: '#FF6B6B' },
  completed: { label: '완료', color: '#4CAF50' },
  cancelled: { label: '취소', color: '#F44336' },
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrder = ({ item }) => {
    const statusInfo = ORDER_STATUS_MAP[item.status] || ORDER_STATUS_MAP.pending;

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Title>주문 #{item.id}</Title>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString('ko-KR')}
              </Text>
            </View>
            <Chip
              style={{ backgroundColor: statusInfo.color }}
              textStyle={{ color: '#fff' }}
            >
              {statusInfo.label}
            </Chip>
          </View>

          {item.store && (
            <Text style={styles.storeName}>{item.store.name}</Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.itemCount}>
              {item.order_items?.length || 0}개 상품
            </Text>
            <Title style={styles.totalPrice}>
              ₩{item.total_amount.toLocaleString()}
            </Title>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>주문 내역이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
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
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  totalPrice: {
    fontSize: 18,
    color: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
