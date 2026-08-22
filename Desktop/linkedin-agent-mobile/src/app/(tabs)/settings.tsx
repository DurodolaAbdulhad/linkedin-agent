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
  Switch,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://agent.durodola.africa/api';

// Default ICP Config matching the backend
const DEFAULT_ICP_CONFIG = {
  name: 'Ascent Finance - SME Founders',
  mustHave: [
    { field: 'title', keywords: ['founder', 'ceo', 'owner'], weight: 25 },
    { field: 'company_size', min: 1, max: 500, weight: 20 },
  ],
  strongSignals: [
    { field: 'industry', keywords: ['fintech', 'saas', 'tech'], weight: 20 },
    { field: 'painPoint', keywords: ['cash flow', 'finance'], weight: 15 },
  ],
  niceToHave: [
    { field: 'location', keywords: ['us', 'africa'], weight: 5 },
  ],
  disqualifiers: [
    { field: 'title', keywords: ['student', 'intern'], weight: -100 },
  ],
  thresholds: {
    autoPass: 75,
    maybe: 50,
    fail: 0,
  },
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('icp-scoring');
  const [loading, setLoading] = useState(true);
  const [icpConfig, setIcpConfig] = useState(DEFAULT_ICP_CONFIG);
  const [allData, setAllData] = useState({
    focus: null,
    products: [],
    audiences: [],
    offers: [],
    resources: [],
  });

  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testProfile, setTestProfile] = useState({
    title: 'Founder',
    company_size: '50',
    industry: 'fintech',
    painPoint: 'cash flow',
  });
  const [testResult, setTestResult] = useState(null);
  const [thresholds, setThresholds] = useState(DEFAULT_ICP_CONFIG.thresholds);

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

      setAllData({
        focus: focusRes.data,
        products: productsRes.data,
        audiences: audiencesRes.data,
        offers: offersRes.data,
        resources: resourcesRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ICP Scoring Test Function
  const testICPScore = () => {
    let score = 0;
    let maxScore = 0;
    const reasons = [];

    // Must-haves
    const mustHavePass = icpConfig.mustHave.every((criterion) => {
      maxScore += criterion.weight;
      const fieldValue = testProfile[criterion.field]?.toString().toLowerCase() || '';
      const passes = criterion.keywords.some((kw) => fieldValue.includes(kw.toLowerCase()));

      if (passes) {
        score += criterion.weight;
        reasons.push(`✓ Must-have: ${criterion.field}`);
      } else {
        reasons.push(`✗ FAILED: ${criterion.field}`);
      }
      return passes;
    });

    if (!mustHavePass) {
      setTestResult({
        score: 0,
        tier: 'fail',
        reasons: [...reasons, 'Must-have criteria not met'],
      });
      return;
    }

    // Strong signals
    icpConfig.strongSignals.forEach((criterion) => {
      maxScore += criterion.weight;
      const fieldValue = testProfile[criterion.field]?.toString().toLowerCase() || '';
      const passes = criterion.keywords.some((kw) => fieldValue.includes(kw.toLowerCase()));

      if (passes) {
        score += criterion.weight;
        reasons.push(`✓ Strong: ${criterion.field}`);
      } else {
        reasons.push(`○ Missed: ${criterion.field}`);
      }
    });

    // Nice-to-haves
    icpConfig.niceToHave.forEach((criterion) => {
      maxScore += criterion.weight;
      const fieldValue = testProfile[criterion.field]?.toString().toLowerCase() || '';
      const passes = criterion.keywords.some((kw) => fieldValue.includes(kw.toLowerCase()));

      if (passes) {
        score += criterion.weight;
        reasons.push(`+ Nice: ${criterion.field}`);
      }
    });

    const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    let tier = 'fail';
    if (normalizedScore >= thresholds.autoPass) tier = 'auto-pass';
    else if (normalizedScore >= thresholds.maybe) tier = 'maybe';

    setTestResult({ score: normalizedScore, tier, reasons });
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
        <Text style={styles.headerSubtitle}>Complete control</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'icp-scoring' && styles.activeTab]}
          onPress={() => setActiveTab('icp-scoring')}
        >
          <Text style={[styles.tabText, activeTab === 'icp-scoring' && styles.activeTabText]}>ICP Scoring</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'focus' && styles.activeTab]}
          onPress={() => setActiveTab('focus')}
        >
          <Text style={[styles.tabText, activeTab === 'focus' && styles.activeTabText]}>Focus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'audiences' && styles.activeTab]}
          onPress={() => setActiveTab('audiences')}
        >
          <Text style={[styles.tabText, activeTab === 'audiences' && styles.activeTabText]}>Audiences</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>Resources</Text>
        </TouchableOpacity>
      </View>

      {/* ICP SCORING TAB */}
      {activeTab === 'icp-scoring' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 ICP Scoring Engine</Text>
          <Text style={styles.subtitle}>Intelligent prospect filtering</Text>

          {/* Config Overview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current ICP: {icpConfig.name}</Text>
            <Text style={styles.description}>
              Automatically scores profiles and decides whether to send outreach
            </Text>
          </View>

          {/* Scoring Tiers */}
          <View style={styles.tierContainer}>
            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>✅</Text>
              <Text style={styles.tierLabel}>Auto-Pass</Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(thresholds.autoPass)}
                onChangeText={(text) => setThresholds({ ...thresholds, autoPass: parseInt(text) || 75 })}
                placeholder="75"
                keyboardType="numeric"
              />
              <Text style={styles.tierDesc}>Instant outreach</Text>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>🔍</Text>
              <Text style={styles.tierLabel}>Maybe</Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(thresholds.maybe)}
                onChangeText={(text) => setThresholds({ ...thresholds, maybe: parseInt(text) || 50 })}
                placeholder="50"
                keyboardType="numeric"
              />
              <Text style={styles.tierDesc}>Human review</Text>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>❌</Text>
              <Text style={styles.tierLabel}>Fail</Text>
              <Text style={styles.thresholdValue}>{'<' + thresholds.maybe}</Text>
              <Text style={styles.tierDesc}>Auto-discard</Text>
            </View>
          </View>

          {/* Must-Have Criteria */}
          <View style={styles.criteriaSection}>
            <Text style={styles.criteriaTitle}>📌 Must-Have (Any failure = instant fail)</Text>
            {icpConfig.mustHave.map((criterion, idx) => (
              <View key={idx} style={styles.criterionCard}>
                <View style={styles.criterionHeader}>
                  <Text style={styles.criterionField}>{criterion.field}</Text>
                  <Text style={styles.criterionWeight}>{criterion.weight}pts</Text>
                </View>
                <Text style={styles.criterionValue}>{criterion.keywords?.join(', ') || criterion.min + '-' + criterion.max}</Text>
              </View>
            ))}
          </View>

          {/* Strong Signals */}
          <View style={styles.criteriaSection}>
            <Text style={styles.criteriaTitle}>⚡ Strong Signals</Text>
            {icpConfig.strongSignals.map((criterion, idx) => (
              <View key={idx} style={styles.criterionCard}>
                <View style={styles.criterionHeader}>
                  <Text style={styles.criterionField}>{criterion.field}</Text>
                  <Text style={styles.criterionWeight}>{criterion.weight}pts</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Test Tool */}
          <View style={styles.testSection}>
            <Text style={styles.testTitle}>🧪 Test Profile Scoring</Text>
            <TouchableOpacity style={styles.button} onPress={() => setShowTestModal(true)}>
              <Text style={styles.buttonText}>Test a Profile</Text>
            </TouchableOpacity>

            {testResult && (
              <View style={[styles.card, styles.testResultCard]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultScore}>{testResult.score}</Text>
                  <Text style={[styles.resultTier, { color: testResult.tier === 'auto-pass' ? '#22c55e' : testResult.tier === 'maybe' ? '#f59e0b' : '#ef4444' }]}>
                    {testResult.tier}
                  </Text>
                </View>
                {testResult.reasons.map((reason, idx) => (
                  <Text key={idx} style={styles.reason}>
                    {reason}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              Alert.alert('Success', 'ICP thresholds updated');
            }}
          >
            <Text style={styles.buttonText}>💾 Save ICP Config</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OTHER TABS - Simplified */}
      {activeTab === 'focus' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Current Focus</Text>
          {allData.focus ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{allData.focus.name}</Text>
              <Text style={styles.cardDesc}>{allData.focus.objective}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No focus period set</Text>
          )}
        </View>
      )}

      {activeTab === 'audiences' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Audiences</Text>
          {allData.audiences.length > 0 ? (
            allData.audiences.map((audience) => (
              <View key={audience._id} style={styles.card}>
                <Text style={styles.cardTitle}>{audience.persona}</Text>
                <Text style={styles.cardDesc}>{audience.product}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No audiences configured</Text>
          )}
        </View>
      )}

      {activeTab === 'resources' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Resources</Text>
          {allData.resources.length > 0 ? (
            allData.resources.map((resource, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardTitle}>{resource.name}</Text>
                <Text style={styles.cardDesc}>{resource.type}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No resources available</Text>
          )}
        </View>
      )}

      {/* Test Modal */}
      <Modal visible={showTestModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Test ICP Scoring</Text>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={testProfile.title}
              onChangeText={(text) => setTestProfile({ ...testProfile, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Company Size"
              value={testProfile.company_size}
              onChangeText={(text) => setTestProfile({ ...testProfile, company_size: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Industry"
              value={testProfile.industry}
              onChangeText={(text) => setTestProfile({ ...testProfile, industry: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pain Point"
              value={testProfile.painPoint}
              onChangeText={(text) => setTestProfile({ ...testProfile, painPoint: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowTestModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  testICPScore();
                  setShowTestModal(false);
                }}
              >
                <Text style={styles.buttonText}>Score Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { backgroundColor: '#0D9488', paddingHorizontal: 16, paddingVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#c8f9e4', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#0D9488' },
  tabText: { fontSize: 11, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#0D9488' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#0D9488' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 4 },
  description: { fontSize: 13, color: '#666', marginTop: 8 },
  tierContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tierCard: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, alignItems: 'center' },
  tierEmoji: { fontSize: 24, marginBottom: 6 },
  tierLabel: { fontSize: 13, fontWeight: '600', color: '#000', marginBottom: 6 },
  thresholdInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingVertical: 6, textAlign: 'center', marginBottom: 6, fontSize: 12 },
  thresholdValue: { fontSize: 14, fontWeight: '600', color: '#0D9488', marginBottom: 4 },
  tierDesc: { fontSize: 11, color: '#999' },
  criteriaSection: { marginBottom: 20 },
  criteriaTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 10 },
  criterionCard: { backgroundColor: '#fff', borderRadius: 6, padding: 10, marginBottom: 8 },
  criterionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  criterionField: { fontSize: 13, fontWeight: '500', color: '#000' },
  criterionWeight: { fontSize: 12, color: '#0D9488', fontWeight: '600' },
  criterionValue: { fontSize: 12, color: '#666', marginTop: 4 },
  testSection: { marginTop: 20, marginBottom: 20 },
  testTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 12 },
  testResultCard: { marginTop: 12 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultScore: { fontSize: 32, fontWeight: '700', color: '#0D9488' },
  resultTier: { fontSize: 14, fontWeight: '600' },
  reason: { fontSize: 12, color: '#666', marginBottom: 4 },
  button: { backgroundColor: '#0D9488', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  primaryButton: { marginBottom: 30 },
  cancelBtn: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
