import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://agent.durodola.africa/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('focus');
  const [loading, setLoading] = useState(true);
  const [activeFocus, setActiveFocus] = useState<any>(null);
  const [focusList, setFocusList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<{ [key: number]: number }>({});
  
  // Modal states
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  
  // Form states
  const [focusForm, setFocusForm] = useState({ name: '', objective: '' });
  const [productForm, setProductForm] = useState({ name: '' });
  const [audienceForm, setAudienceForm] = useState({ persona: '', product: '', tone: '' });
  const [offerForm, setOfferForm] = useState({ product: '', price: '' });
  const [resourceForm, setResourceForm] = useState({ name: '', type: 'guide', url: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [focusRes, productsRes, audiencesRes, offersRes, resourcesRes] = await Promise.all([
        axios.get(`${API_URL}/focus/active`, { timeout: 10000 }).catch(() => ({ data: null })),
        axios.get(`${API_URL}/products`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/audiences`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/offers`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/resources`, { timeout: 10000 }).catch(() => ({ data: [] })),
      ]);

      setActiveFocus(focusRes.data);
      setProducts(productsRes.data);
      setAudiences(audiencesRes.data);
      setOffers(offersRes.data);
      setResources(resourcesRes.data);

      if (focusRes.data?.productAllocation) {
        setAllocation(focusRes.data.productAllocation);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // FOCUS MANAGEMENT
  const handleAddFocus = async () => {
    if (!focusForm.name || !focusForm.objective) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/focus`, focusForm);
      Alert.alert('Success', 'Focus period added');
      setShowFocusModal(false);
      setFocusForm({ name: '', objective: '' });
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add focus period');
    }
  };

  const handleDeleteFocus = async (id: string) => {
    Alert.alert('Delete Focus', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/focus/${id}`);
            Alert.alert('Success', 'Focus period deleted');
            fetchAllData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  // PRODUCT MANAGEMENT
  const handleAddProduct = async () => {
    if (!productForm.name) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }
    try {
      await axios.post(`${API_URL}/products`, productForm);
      Alert.alert('Success', 'Product added');
      setShowProductModal(false);
      setProductForm({ name: '' });
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/products/${id}`);
            Alert.alert('Success', 'Product deleted');
            fetchAllData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  // AUDIENCE (ICP) MANAGEMENT
  const handleAddAudience = async () => {
    if (!audienceForm.persona || !audienceForm.product) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/audiences`, audienceForm);
      Alert.alert('Success', 'Audience added');
      setShowAudienceModal(false);
      setAudienceForm({ persona: '', product: '', tone: '' });
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add audience');
    }
  };

  const handleDeleteAudience = async (id: string) => {
    Alert.alert('Delete Audience', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/audiences/${id}`);
            Alert.alert('Success', 'Audience deleted');
            fetchAllData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  // OFFER MANAGEMENT
  const handleAddOffer = async () => {
    if (!offerForm.product || !offerForm.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/offers`, { ...offerForm, price: parseFloat(offerForm.price) });
      Alert.alert('Success', 'Offer added');
      setShowOfferModal(false);
      setOfferForm({ product: '', price: '' });
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add offer');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    Alert.alert('Delete Offer', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/offers/${id}`);
            Alert.alert('Success', 'Offer deleted');
            fetchAllData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  // RESOURCE MANAGEMENT
  const handleAddResource = async () => {
    if (!resourceForm.name || !resourceForm.type) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    try {
      await axios.post(`${API_URL}/resources`, resourceForm);
      Alert.alert('Success', 'Resource added');
      setShowResourceModal(false);
      setResourceForm({ name: '', type: 'guide', url: '' });
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    Alert.alert('Delete Resource', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/resources/${id}`);
            Alert.alert('Success', 'Resource deleted');
            fetchAllData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleSaveAllocation = async () => {
    try {
      const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      if (total !== 100) {
        Alert.alert('Error', `Allocations must sum to 100% (current: ${total}%)`);
        return;
      }

      await axios.put(`${API_URL}/focus/${activeFocus._id}/allocate`, { productAllocation: allocation });
      Alert.alert('Success', 'Allocation updated');
      fetchAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save allocation');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Founder GTM OS</Text>
        <Text style={styles.headerSubtitle}>Manage all settings</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'focus' && styles.activeTab]}
          onPress={() => setActiveTab('focus')}
        >
          <Text style={[styles.tabText, activeTab === 'focus' && styles.activeTabText]}>Focus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'icp' && styles.activeTab]}
          onPress={() => setActiveTab('icp')}
        >
          <Text style={[styles.tabText, activeTab === 'icp' && styles.activeTabText]}>ICP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>Offers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>Resources</Text>
        </TouchableOpacity>
      </View>

      {/* FOCUS TAB */}
      {activeTab === 'focus' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Focus Periods</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowFocusModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {activeFocus && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{activeFocus.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteFocus(activeFocus._id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDesc}>{activeFocus.description}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Objective:</Text>
                <Text style={styles.value}>{activeFocus.objective}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🟢 Active</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.allocationSection}>
            <Text style={styles.sectionTitle}>📊 Product Allocation</Text>
            {products.map((product) => (
              <View key={product._id} style={styles.allocationRow}>
                <Text style={styles.allocationLabel}>{product.name}</Text>
                <TextInput
                  style={styles.allocationInput}
                  value={String(allocation[product._id] || 0)}
                  onChangeText={(text) => {
                    const val = parseInt(text) || 0;
                    setAllocation({ ...allocation, [product._id]: val });
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.allocationPercent}>%</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={handleSaveAllocation}>
              <Text style={styles.buttonText}>💾 Save Allocation</Text>
            </TouchableOpacity>
          </View>

          {/* Focus Modal */}
          <Modal visible={showFocusModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Focus Period</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Focus name"
                  value={focusForm.name}
                  onChangeText={(text) => setFocusForm({ ...focusForm, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Objective"
                  value={focusForm.objective}
                  onChangeText={(text) => setFocusForm({ ...focusForm, objective: text })}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowFocusModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleAddFocus}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 Products</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowProductModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {products.map((product) => (
            <View key={product._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{product.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteProduct(product._id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {products.length === 0 && <Text style={styles.emptyText}>No products yet</Text>}

          {/* Product Modal */}
          <Modal visible={showProductModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Product</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Product name"
                  value={productForm.name}
                  onChangeText={(text) => setProductForm({ name: text })}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowProductModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* ICP TAB */}
      {activeTab === 'icp' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 ICP Audiences</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAudienceModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {audiences.map((audience) => (
            <View key={audience._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{audience.persona}</Text>
                <TouchableOpacity onPress={() => handleDeleteAudience(audience._id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Product:</Text>
                <Text style={styles.value}>{audience.product}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tone:</Text>
                <Text style={styles.value}>{audience.tone}</Text>
              </View>
            </View>
          ))}

          {audiences.length === 0 && <Text style={styles.emptyText}>No audiences yet</Text>}

          {/* Audience Modal */}
          <Modal visible={showAudienceModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Audience</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Persona name"
                  value={audienceForm.persona}
                  onChangeText={(text) => setAudienceForm({ ...audienceForm, persona: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Product"
                  value={audienceForm.product}
                  onChangeText={(text) => setAudienceForm({ ...audienceForm, product: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tone (optional)"
                  value={audienceForm.tone}
                  onChangeText={(text) => setAudienceForm({ ...audienceForm, tone: text })}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowAudienceModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleAddAudience}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* OFFERS TAB */}
      {activeTab === 'offers' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 Offers</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowOfferModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {offers.map((offer) => (
            <View key={offer._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{offer.product}</Text>
                <TouchableOpacity onPress={() => handleDeleteOffer(offer._id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>${offer.price}</Text>
              </View>
            </View>
          ))}

          {offers.length === 0 && <Text style={styles.emptyText}>No offers yet</Text>}

          {/* Offer Modal */}
          <Modal visible={showOfferModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Offer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Product name"
                  value={offerForm.product}
                  onChangeText={(text) => setOfferForm({ ...offerForm, product: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={offerForm.price}
                  onChangeText={(text) => setOfferForm({ ...offerForm, price: text })}
                  keyboardType="decimal-pad"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowOfferModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleAddOffer}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* RESOURCES TAB */}
      {activeTab === 'resources' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Resource Library</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowResourceModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {resources.map((resource, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{resource.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteResource(resource._id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Type:</Text>
                <Text style={styles.value}>{resource.type}</Text>
              </View>
              {resource.url && (
                <View style={styles.row}>
                  <Text style={styles.label}>URL:</Text>
                  <Text style={[styles.value, { fontSize: 11 }]}>{resource.url}</Text>
                </View>
              )}
            </View>
          ))}

          {resources.length === 0 && <Text style={styles.emptyText}>No resources yet</Text>}

          {/* Resource Modal */}
          <Modal visible={showResourceModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Resource</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Resource name"
                  value={resourceForm.name}
                  onChangeText={(text) => setResourceForm({ ...resourceForm, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Type (guide, ebook, template)"
                  value={resourceForm.type}
                  onChangeText={(text) => setResourceForm({ ...resourceForm, type: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="URL (optional)"
                  value={resourceForm.url}
                  onChangeText={(text) => setResourceForm({ ...resourceForm, url: text })}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowResourceModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleAddResource}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#c8f9e4',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0D9488',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0D9488',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  addBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0D9488',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  deleteBtn: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '600',
  },
  allocationSection: {
    marginTop: 20,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  allocationLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  allocationInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  allocationPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  button: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
