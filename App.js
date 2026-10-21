
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
} from 'react-native';

const SUPABASE_URL = 'PROJECT_URL_BURAYA';
const SUPABASE_KEY = 'PUBLISHABLE_KEY_BURAYA';

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
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
          throw new Error(`Ürünler alınamadı (${response.status})`);
        }

        setProducts(await response.json());
      } catch (e) {
        setError(e.message || 'Bağlantı kurulamadı.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    'Tümü',
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLocaleLowerCase('tr')
      .includes(search.toLocaleLowerCase('tr'));

    return (
      matchesSearch &&
      (category === 'Tümü' || product.category === category)
    );
  });

  const total = cart.reduce(
    (sum, product) => sum + Number(product.price),
    0
  );

  function addToCart(product) {
    if (product.stock < 1) {
      alert('Bu ürün şu anda stokta yok.');
      return;
    }

    setCart((current) => [...current, product]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BULZOVİK</Text>
            <Text style={styles.subtitle}>Aradığın burada.</Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() =>
              alert(
                `Sepet: ${cart.length} ürün\nToplam: ${total.toLocaleString('tr-TR')} TL`
              )
            }
          >
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

        <Text style={styles.sectionTitle}>Ürünler</Text>

        {loading && <ActivityIndicator size="large" color="#171923" />}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {!loading && !error && products.length === 0 && (
          <Text style={styles.empty}>Henüz ürün bulunamadı.</Text>
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
              <Text style={styles.productCategory}>{product.category}</Text>
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

        <Text style={styles.footer}>BULZOVİK © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  content: { padding: 18, paddingBottom: 35 },
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
  subtitle: { color: '#CBD5E0', marginTop: 4 },
  cartButton: {
    backgroundColor: '#F6AD55',
    padding: 12,
    borderRadius: 12,
  },
  cartText: { fontWeight: 'bold', fontSize: 16 },
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
  category: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: { backgroundColor: '#171923', borderColor: '#171923' },
  categoryText: { color: '#333333', fontWeight: '600' },
  selectedCategoryText: { color: '#FFFFFF' },
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
  productCategory: { color: '#718096', marginTop: 4, fontSize: 12 },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#D97706',
    marginTop: 9,
    marginBottom: 8,
  },
  stock: { color: '#718096', fontSize: 12, marginBottom: 10 },
  addButton: {
    backgroundColor: '#171923',
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 30, color: '#718096' },
  error: { color: '#B91C1C', marginVertical: 12 },
  footer: { textAlign: 'center', color: '#718096', marginTop: 28 },
});
