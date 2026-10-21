
import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Genel');
  const [stock, setStock] = useState('10');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function request(path, options = {}, token = SUPABASE_KEY) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const detail =
        typeof data === 'string'
          ? data
          : data?.message || data?.msg || JSON.stringify(data);
      throw new Error(`Hata ${response.status}: ${detail}`);
    }

    return data;
  }

  async function login() {
    setLoading(true);
    setMessage('');

    try {
      const result = await request(
        '/auth/v1/token?grant_type=password',
        {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const user = result.user;

      const admins = await request(
        `/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`,
        {},
        result.access_token
      );

      if (!admins || admins.length === 0) {
        throw new Error(
          'Bu hesap yönetici olarak yetkilendirilmemiş.'
        );
      }

      setSession(result);
      setIsAdmin(true);
      setMessage('Yönetici girişi başarılı.');
      await loadProducts(result.access_token);
    } catch (error) {
      setMessage(error.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts(token = session?.access_token) {
    if (!token) return;

    try {
      const data = await request(
        '/rest/v1/products?select=id,name,description,price,category,stock,is_active&is_active=eq.true&order=id.desc',
        {},
        token
      );
      setProducts(data || []);
    } catch (error) {
      setMessage(error.message || 'Ürünler yüklenemedi.');
    }
  }

  function resetForm() {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Genel');
    setStock('10');
    setEditingId(null);
  }

  async function saveProduct() {
    if (!name.trim() || price.trim() === '') {
      setMessage('Ürün adı ve fiyat zorunludur.');
      return;
    }

    const numericPrice = Number(price.replace(',', '.'));
    const numericStock = Number(stock);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setMessage('Fiyat ve stok değerlerini kontrol et.');
      return;
    }

    setLoading(true);
    setMessage('');

    const product = {
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim() || 'Genel',
      stock: numericStock,
      is_active: true,
    };

    try {
      if (editingId !== null) {
        await request(
          `/rest/v1/products?id=eq.${editingId}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(product),
          },
          session.access_token
        );
        setMessage('Ürün güncellendi.');
      } else {
        await request(
          '/rest/v1/products',
          {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(product),
          },
          session.access_token
        );
        setMessage('Yeni ürün eklendi.');
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      setMessage(error.message || 'Ürün kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(String(product.price));
    setCategory(product.category || 'Genel');
    setStock(String(product.stock ?? 0));
    setMessage('Ürünü düzenleyip Kaydet düğmesine bas.');
  }

  async function deactivateProduct(product) {
    setLoading(true);
    setMessage('');

    try {
      await request(
        `/rest/v1/products?id=eq.${product.id}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ is_active: false }),
        },
        session.access_token
      );

      setMessage('Ürün satıştan kaldırıldı.');
      await loadProducts();
    } catch (error) {
      setMessage(error.message || 'Ürün kaldırılamadı.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
    setIsAdmin(false);
    setProducts([]);
    setPassword('');
    resetForm();
    setMessage('Oturum kapatıldı.');
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.loginPage}>
          <Text style={styles.logo}>BULZOVİK</Text>
          <Text style={styles.heading}>Yönetici Paneli</Text>
          <Text style={styles.muted}>
            Yönetici hesabınla giriş yap.
          </Text>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta adresin"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Şifren"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={login}
            disabled={loading}
          >
            <Text style={styles.primaryText}>
              {loading ? 'Kontrol ediliyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          {!!message && <Text style={styles.message}>{message}</Text>}
          <Text style={styles.note}>
            Yalnızca yönetici yetkisi olan hesaplar panele girebilir.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BULZOVİK</Text>
            <Text style={styles.subtitle}>Yönetim Paneli</Text>
          </View>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heading}>
          {editingId !== null ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </Text>

        <Text style={styles.label}>Ürün adı *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ör. Spor ayakkabı"
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ürün açıklaması"
          multiline
        />

        <Text style={styles.label}>Fiyat (TL) *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="499"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Kategori</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Moda, Elektronik, Ev..."
        />

        <Text style={styles.label}>Stok</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          placeholder="10"
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveProduct}
          disabled={loading}
        >
          <Text style={styles.primaryText}>
            {loading
              ? 'İşleniyor...'
              : editingId !== null
              ? 'Değişiklikleri Kaydet'
              : 'Ürünü Ekle'}
          </Text>
        </TouchableOpacity>

        {editingId !== null && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetForm}
          >
            <Text style={styles.secondaryText}>Düzenlemeyi İptal Et</Text>
          </TouchableOpacity>
        )}

        {!!message && <Text style={styles.message}>{message}</Text>}

        <View style={styles.listHeader}>
          <Text style={styles.heading}>Aktif Ürünler</Text>
          <TouchableOpacity onPress={() => loadProducts()}>
            <Text style={styles.refresh}>Yenile ↻</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#171923" />}

        {products.map((product) => (
          <View key={product.id} style={styles.product}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.muted}>{product.category}</Text>
            <Text style={styles.price}>
              {Number(product.price).toLocaleString('tr-TR')} TL
            </Text>
            <Text style={styles.muted}>Stok: {product.stock}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editProduct(product)}
              >
                <Text style={styles.actionText}>Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => deactivateProduct(product)}
              >
                <Text style={styles.actionText}>Satıştan Kaldır</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {!loading && products.length === 0 && (
          <Text style={styles.muted}>Henüz aktif ürün yok.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  page: { padding: 18, paddingBottom: 40 },
  loginPage: {
    padding: 22,
    paddingTop: 70,
    paddingBottom: 40,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171923',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  logo: {
    fontSize: 27,
    fontWeight: '900',
    color: '#171923',
    letterSpacing: 1,
  },
  subtitle: { color: '#CBD5E0', marginTop: 4 },
  heading: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#171923',
    marginTop: 18,
    marginBottom: 12,
  },
  muted: { color: '#718096', marginBottom: 10 },
  label: {
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DEE8',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
  },
  multiline: { minHeight: 75, textAlignVertical: 'top' },
  primaryButton: {
    backgroundColor: '#171923',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: { color: '#171923', fontWeight: '600' },
  message: {
    backgroundColor: '#FFF7E6',
    color: '#7C4A03',
    padding: 12,
    borderRadius: 9,
    marginTop: 14,
  },
  note: { color: '#718096', fontSize: 12, marginTop: 20 },
  logout: { backgroundColor: '#F6AD55', padding: 11, borderRadius: 9 },
  logoutText: { color: '#171923', fontWeight: 'bold' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  refresh: { color: '#D97706', fontWeight: 'bold' },
  product: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
    marginBottom: 12,
  },
  productName: { color: '#171923', fontWeight: 'bold', fontSize: 16 },
  price: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 17,
    marginVertical: 6,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  editButton: {
    backgroundColor: '#171923',
    padding: 11,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#B91C1C',
    padding: 11,
    borderRadius: 8,
  },
  actionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});
