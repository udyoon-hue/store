import React from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Card, Title, Text, Button, IconButton, Divider } from 'react-native-paper';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const {
    cart,
    store,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = store?.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  const renderCartItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Title style={styles.itemName}>{item.name}</Title>
            <Text style={styles.itemPrice}>₩{item.price.toLocaleString()}</Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={() => removeFromCart(item.id)}
          />
        </View>

        <View style={styles.quantityControl}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          />
          <Text style={styles.quantity}>{item.quantity}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          />
          <Text style={styles.itemTotal}>
            ₩{(item.price * item.quantity).toLocaleString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')}>
          가게 둘러보기
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {store && (
          <Card style={styles.storeCard}>
            <Card.Content>
              <Title>{store.name}</Title>
              <Text style={styles.storeAddress}>{store.address}</Text>
            </Card.Content>
          </Card>
        )}

        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />

        <Card style={styles.summaryCard}>
          <Card.Content>
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

        <Button
          mode="text"
          onPress={clearCart}
          style={styles.clearButton}
          textColor="#FF6B6B"
        >
          장바구니 비우기
        </Button>
      </ScrollView>

      <View style={styles.checkoutButton}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Checkout')}
          disabled={subtotal < (store?.min_order_amount || 0)}
        >
          {subtotal < (store?.min_order_amount || 0)
            ? `최소 주문금액: ₩${store?.min_order_amount.toLocaleString()}`
            : '주문하기'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  storeCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  summaryCard: {
    margin: 16,
    elevation: 2,
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
  clearButton: {
    marginHorizontal: 16,
    marginBottom: 80,
  },
  checkoutButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 8,
  },
});
