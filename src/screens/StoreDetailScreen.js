import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, Divider, Snackbar } from 'react-native-paper';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

export default function StoreDetailScreen({ route, navigation }) {
  const { store } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { addToCart, setStore: setCartStore, getCartCount } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({ store_id: store.id });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (result.success) {
      setCartStore(store);
      setSnackbarMessage('장바구니에 추가되었습니다');
    } else {
      setSnackbarMessage(result.error);
    }

    setSnackbarVisible(true);
  };

  const renderProduct = ({ item }) => (
    <Card style={styles.productCard}>
      <Card.Content>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Title>{item.name}</Title>
            <Paragraph numberOfLines={2}>{item.description}</Paragraph>
            <Text style={styles.price}>₩{item.price.toLocaleString()}</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleAddToCart(item)}
            disabled={!item.is_available}
            compact
          >
            {item.is_available ? '담기' : '품절'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.storeCard}>
          <Card.Content>
            <Title style={styles.storeName}>{store.name}</Title>
            <Paragraph>{store.description}</Paragraph>
            <View style={styles.storeInfo}>
              <Chip icon="star" style={styles.chip}>
                {store.rating.toFixed(1)}
              </Chip>
              <Chip icon="motorbike" style={styles.chip}>
                배달비: ₩{store.delivery_fee.toLocaleString()}
              </Chip>
            </View>
            <Text style={styles.minOrder}>
              최소주문: ₩{store.min_order_amount.toLocaleString()}
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.address}>{store.address}</Text>
            {store.opening_hours && (
              <Text style={styles.hours}>영업시간: {store.opening_hours}</Text>
            )}
          </Card.Content>
        </Card>

        <View style={styles.productsSection}>
          <Title style={styles.sectionTitle}>메뉴</Title>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text>상품이 없습니다</Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {getCartCount() > 0 && (
        <View style={styles.cartButton}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Cart')}
            icon="cart"
          >
            장바구니 ({getCartCount()})
          </Button>
        </View>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  storeCard: {
    margin: 16,
    elevation: 2,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  storeInfo: {
    flexDirection: 'row',
    marginTop: 12,
  },
  chip: {
    marginRight: 8,
  },
  minOrder: {
    marginTop: 8,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  hours: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  productCard: {
    marginBottom: 12,
    elevation: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 8,
  },
});
