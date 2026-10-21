
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

const SUPABASE_URL = 'nkczfvapwgmpmumfwses';
const SUPABASE_KEY = 'sb_publishable_YgTYxkXdPDTqnPnbPjMwJQ_5JULfgZL';

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      if (
        SUPABASE_URL.includes('_BURAYA') ||
        SUPABASE_KEY.includes('_BURAYA')
      ) {
        throw new Error('Supabase bağlantı bilgilerini App.js içine yazmalısın.');
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=id,name,description,price,category,stock,image_url&is_active=eq.true&order=id.asc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Supabase hatası (${response.status}): ${details}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [
    'Tümü',
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLocaleLowerCase('tr')
      .includes(search.toLocaleLowerCase('tr'));

    const matchesCategory =
      category === 'Tümü' || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const total = cart.reduce(
    (sum, product) => sum + Number(product.price),
    0
  );

  function addToCart(product) {
    if (product.stock <= 0) {
      Alert.alert('Stok bilgisi', 'Bu ürün şu anda stokta yok.');
      return;
    }

    setCart((current) => [...current, product]);
  }

  function showCart() {
    const lines = cart.map(
      (product, index) =>
        `${index + 1}. ${product.name} — ${Number(product.price).toLocaleString('tr-TR')} TL`
    );

    Alert.alert(
      'Alışveriş sepetin',
      cart.length
        ? `${lines.join('\n')}\n\nToplam: ${total.toLocaleString('tr-TR')} TL`
        : 'Sepetin şu anda boş.'
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BULZOVİK</Text>
            <Text style={styles.subtitle}>Aradığın burada.</Text>
          </View>

          <TouchableOpacity style={styles.cartButton} onPress={showCart}>
            <Text style={styles.cartText}>🛒 {cart.length}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Alışverişe hoş geldin!</Text>

        <TextInput
          style={styles.search}
          placeholder="Ürün ara..."
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.sectionTitle}>Kategoriler</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.category,
                category === item && styles.selectedCategory,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Ürünler</Text>
          <TouchableOpacity onPress={loadProducts}>
            <Text style={styles.refresh}>Yenile ↻</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#171923"
            style={styles.loader}
          />
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Ürünler yüklenemedi</Text>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && products.length === 0 && (
          <Text style={styles.empty}>Henüz aktif ürün bulunamadı.</Text>
        )}

        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.product}>
              <Text style={styles.productEmoji}>
                {product.category === 'Moda'
                  ? '👟'
                  : product.category === 'Elektronik'
                  ? '🎧'
                  : product.category === 'Ev'
                  ? '🏠'
                  : '🛍️'}
              </Text>

              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>
                {product.category}
              </Text>
              <Text style={styles.price}>
                {Number(product.price).toLocaleString('tr-TR')} TL
              </Text>
              <Text style={styles.stock}>Stok: {product.stock}</Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(product)}
              >
                <Text style={styles.addButtonText}>Sepete Ekle</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {!loading && !error && products.length > 0 &&
          filteredProducts.length === 0 && (
            <Text style={styles.empty}>Aramana uygun ürün bulunamadı.</Text>
          )}

        <Text style={styles.footer}>BULZOVİK © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171923',
    padding: 18,
    borderRadius: 18,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#CBD5E0',
    marginTop: 4,
  },
  cartButton: {
    backgroundColor: '#F6AD55',
    padding: 12,
    borderRadius: 12,
  },
  cartText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcome: {
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 14,
    color: '#171923',
  },
  search: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 14,
    color: '#171923',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refresh: {
    color: '#D97706',
    fontWeight: 'bold',
    marginTop: 10,
  },
  loader: {
    marginVertical: 25,
  },
  category: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    backgroundColor: '#171923',
    borderColor: '#171923',
  },
  categoryText: {
    color: '#333333',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  product: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF0F5',
  },
  productEmoji: {
    fontSize: 43,
    textAlign: 'center',
    paddingVertical: 13,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#171923',
    minHeight: 36,
  },
  productCategory: {
    color: '#718096',
    marginTop: 4,
    fontSize: 12,
  },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#D97706',
    marginTop: 9,
    marginBottom: 8,
  },
  stock: {
    color: '#718096',
    fontSize: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#171923',
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#718096',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    marginVertical: 14,
  },
  errorTitle: {
    color: '#991B1B',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  error: {
    color: '#991B1B',
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: '#171923',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 28,
  },
});
