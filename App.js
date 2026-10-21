
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const products = [
  { id: '1', name: 'Günlük Sırt Çantası', price: 499, category: 'Moda', emoji: '🎒' },
  { id: '2', name: 'Kablosuz Kulaklık', price: 799, category: 'Elektronik', emoji: '🎧' },
  { id: '3', name: 'Spor Ayakkabı', price: 999, category: 'Moda', emoji: '👟' },
  { id: '4', name: 'Akıllı Saat', price: 1299, category: 'Elektronik', emoji: '⌚' },
  { id: '5', name: 'Kahve Kupası', price: 149, category: 'Ev', emoji: '☕' },
  { id: '6', name: 'Masa Lambası', price: 399, category: 'Ev', emoji: '💡' },
];

const categories = ['Tümü', 'Moda', 'Elektronik', 'Ev'];

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tümü');
  const [cart, setCart] = useState([]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLocaleLowerCase('tr')
      .includes(search.toLocaleLowerCase('tr'));

    const matchesCategory =
      category === 'Tümü' || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  const total = cart.reduce((sum, product) => sum + product.price, 0);

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
            onPress={() => alert(
              `Sepet: ${cart.length} ürün\nToplam: ${total.toLocaleString('tr-TR')} TL`
            )}
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

        <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>

        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.product}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.price}>
                {product.price.toLocaleString('tr-TR')} TL
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addToCart(product)}
              >
                <Text style={styles.addButtonText}>Sepete Ekle</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <Text style={styles.empty}>Ürün bulunamadı.</Text>
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
    marginBottom: 12,
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
  footer: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 28,
  },
});
