
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

const SUPABASE_URL = 'https://nkczfvapwgmpmumfwses.supabase.co';
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
      const url =
        `${SUPABASE_URL}/rest/v1/products` +
        '?select=id,name,description,price,category,stock,image_url' +
        '&is_active=eq.true&order=id.asc';

      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          `Supabase hatası (${response.status}): ${details}`
        );
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
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLocaleLowerCase('tr')
      .includes(search.toLocaleLowerCase('tr'));

    const matchesCategory =
      category === 'Tümü' || p.category === category;

    return matchesSearch && matchesCategory;
  });

  const total = cart.reduce(
    (sum, p) => sum + Number(p.price),
    0
  );

  function addToCart(product) {
    if (Number(product.stock) <= 0) {
      setError(`${product.name} şu anda stokta yok.`);
      return;
    }

    setCart((current) => [...current, product]);
    setError('');
  }

  function showCart() {
    if (cart.length === 0) {
      setError('Sepetin şu anda boş.');
      return;
    }

    const lines = cart.map(
      (p) =>
        `${p.name} — ${Number(p.price).toLocaleString('tr-TR')} TL`
    );

    setError(
      `${lines.join(' | ')} | TOPLAM: ${total.toLocaleString('tr-TR')} TL`
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

          <TouchableOpacity
            style={styles.cartButton}
            onPress={showCart}
          >
            <Text style={styles.cartText}>🛒 {cart.length}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>
          Alışverişe hoş geldin!
        </Text>

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
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {!loading && !error && products.length === 0 && (
          <Text style={styles.empty}>
            Henüz aktif ürün bulunamadı.
          </Text>
        )}

        <View style={styles.productGrid}>
          {filteredProducts.map((p) => (
            <View key={p.id} style={styles.product}>
              <Text style={styles.productEmoji}>
                {p.category === 'Moda'
                  ? '👟'
                  : p.category === 'Elektronik'
                  ? '🎧'
                  : p.category === 'Ev'
                  ? '🏠'
                  : '🛍️'}
              </Text>

              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productCategory}>
                {p.category}
              </Text>

              <Text style={styles.price}>
                {Number(p.price).toLocaleString('tr-TR')} TL
              </Text>

              <Text style={styles.stock}>
                Stok: {p.stock}
              </Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(p)}
              >
                <Text style={styles.addButtonText}>
                  Sepete Ekle
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {!loading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <Text style={styles.empty}>
              Aramana uygun ürün bulunamadı.
            </Text>
          )}

        <Text style={styles.footer}>
          BULZOVİK © 2026
        </Text>
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
  error: {
    color: '#991B1B',
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 28,
  },
});
