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
  Switch,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://agent.durodola.africa/api';

export default function SettingsEnhanced() {
  const [activeTab, setActiveTab] = useState('focus');
  const [loading, setLoading] = useState(true);
  const [activeFocus, setActiveFocus] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<{ [key: number]: number }>({});

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
      Alert.alert('Error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllocation = async () => {
    try {
      const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      if (total !== 100) {
        Alert.alert('Error', `Allocations must sum to 100% (current: ${total}%)`);
        return;
      }

      await axios.put(`${API_URL}/focus/${activeFocus._id}/allocate`, { productAllocation: allocation });
      Alert.alert('Success', 'Focus allocation updated');
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
        <Text style={styles.headerSubtitle}>Strategic configuration</Text>
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
        <View>
          {activeFocus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Current Focus Period</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{activeFocus.name}</Text>
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
            </View>
          )}

          <View style={styles.section}>
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
              <Text style={styles.buttonText}>Save Allocation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ICP TAB */}
      {activeTab === 'icp' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 ICP Configuration</Text>
          <Text style={styles.subtitle}>Ideal Customer Profile Settings</Text>

          {audiences.map((audience) => (
            <View key={audience._id} style={styles.card}>
              <Text style={styles.cardTitle}>{audience.persona}</Text>
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

          {audiences.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No ICP profiles configured yet</Text>
            </View>
          )}
        </View>
      )}

      {/* OFFERS TAB */}
      {activeTab === 'offers' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Offer Configuration</Text>
          <Text style={styles.subtitle}>Product Offers & Pricing</Text>

          {offers.map((offer) => (
            <View key={offer._id} style={styles.card}>
              <Text style={styles.cardTitle}>{offer.product}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>${offer.price}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Trial:</Text>
                <Text style={styles.value}>{offer.trial || 'N/A'}</Text>
              </View>
            </View>
          ))}

          {offers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No offers configured yet</Text>
            </View>
          )}
        </View>
      )}

      {/* RESOURCES TAB */}
      {activeTab === 'resources' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Resource Library</Text>
          <Text style={styles.subtitle}>Ebooks, Guides, Templates & Assets</Text>

          {resources.length > 0 ? (
            resources.map((resource, index) => (
              <View key={index} style={styles.resourceCard}>
                <Text style={styles.resourceIcon}>
                  {resource.type === 'ebook' ? '📕' : resource.type === 'guide' ? '📖' : '📄'}
                </Text>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceTitle}>{resource.name}</Text>
                  <Text style={styles.resourceType}>{resource.type}</Text>
                  {resource.url && (
                    <TouchableOpacity>
                      <Text style={styles.resourceLink}>View Resource →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No resources in library yet</Text>
            </View>
          )}
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
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0D9488',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0D9488',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
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
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  resourceType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  resourceLink: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});
