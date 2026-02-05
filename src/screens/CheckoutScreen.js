import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, TextInput, Button, Text, Divider } from 'react-native-paper';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, store, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = store?.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      Alert.alert('알림', '배달 주소와 전화번호를 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        store_id: store.id,
        delivery_address: address,
        delivery_phone: phone,
        special_requests: specialRequests,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await ordersAPI.createOrder(orderData);

      Alert.alert('주문 완료', '주문이 성공적으로 접수되었습니다', [
        {
          text: '확인',
          onPress: () => {
            clearCart();
            navigation.navigate('OrderDetail', { orderId: response.data.id });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        '주문 실패',
        error.response?.data?.detail || '주문 처리 중 오류가 발생했습니다'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>배달 정보</Title>
          <TextInput
            label="배달 주소 *"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
            multiline
          />
          <TextInput
            label="전화번호 *"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="요청사항"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="예: 문 앞에 놔주세요"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>주문 상품</Title>
          {cart.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.name} x {item.quantity}
              </Text>
              <Text>₩{(item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>결제 정보</Title>
          <View style={styles.summaryRow}>
            <Text>상품 금액</Text>
            <Text>₩{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>배달비</Text>
            <Text>₩{deliveryFee.toLocaleString()}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Title>총 결제금액</Title>
            <Title style={styles.totalPrice}>₩{total.toLocaleString()}</Title>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>결제 방법</Title>
          <Text style={styles.paymentNote}>
            현재는 현금 결제만 가능합니다 (배달 시 결제)
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handlePlaceOrder}
        loading={loading}
        disabled={loading || !address || !phone}
        style={styles.button}
      >
        ₩{total.toLocaleString()} 주문하기
      </Button>
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
  input: {
    marginTop: 12,
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
  paymentNote: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 8,
    marginBottom: 20,
  },
});
