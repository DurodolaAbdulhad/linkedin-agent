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
  const [showTestModal, setShowTestModal] = useState(false);
  const [testProfile, setTestProfile] = useState({
    title: '',
    company_size: '',
    industry: '',
    painPoint: '',
  });
  const [testResult, setTestResult] = useState(null);
  const [thresholds, setThresholds] = useState(DEFAULT_ICP_CONFIG.thresholds);
  const [resources, setResources] = useState([
    { id: 1, name: 'The Fundraising Playbook', type: 'ebook', url: '' },
    { id: 2, name: 'GTM Strategy Blueprint', type: 'ebook', url: '' },
    { id: 3, name: 'Ascent Finance Webinar: Building Financial Systems', type: 'event', url: '' },
    { id: 4, name: 'Ascent Learn Newsletter', type: 'newsletter', url: '' },
    { id: 5, name: 'Ascent Finance - SME Toolkit', type: 'product', url: '' },
  ]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', type: 'ebook', url: '' });

  useEffect(() => {
    setLoading(false);
  }, []);

  const evaluateCriterion = (criterion, fieldValue) => {
    if (criterion.keywords && Array.isArray(criterion.keywords)) {
      return criterion.keywords.some((kw) => fieldValue.includes(kw.toLowerCase()));
    }
    if (criterion.min !== undefined || criterion.max !== undefined) {
      const value = parseFloat(fieldValue);
      if (isNaN(value)) return false;
      const passesMin = criterion.min === undefined || value >= criterion.min;
      const passesMax = criterion.max === undefined || value <= criterion.max;
      return passesMin && passesMax;
    }
    return false;
  };

  const testICPScore = () => {
    let score = 0;
    let maxScore = 0;
    const reasons = [];

    // Must-haves
    const mustHavePass = icpConfig.mustHave.every((criterion) => {
      maxScore += criterion.weight;
      const fieldValue = testProfile[criterion.field]?.toString().toLowerCase() || '';
      const passes = evaluateCriterion(criterion, fieldValue);

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
      const passes = evaluateCriterion(criterion, fieldValue);

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
      const passes = evaluateCriterion(criterion, fieldValue);

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
        <Text style={styles.headerSubtitle}>Intelligent prospect filtering</Text>
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
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'strategy' && styles.activeTab]}
          onPress={() => setActiveTab('strategy')}
        >
          <Text style={[styles.tabText, activeTab === 'strategy' && styles.activeTabText]}>Strategy</Text>
        </TouchableOpacity>
      </View>

      {/* ICP SCORING TAB */}
      {activeTab === 'icp-scoring' && (
        <View style={styles.section}>
          {/* Overview Card */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>🎯 {icpConfig.name}</Text>
            <Text style={styles.overviewDesc}>Automatically scores profiles and decides whether to send outreach</Text>
          </View>

          {/* Scoring Tiers */}
          <Text style={styles.sectionLabel}>Scoring Tiers</Text>
          <View style={styles.tiersGrid}>
            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>✅</Text>
              <Text style={styles.tierName}>Auto-Pass</Text>
              <View style={styles.thresholdBox}>
                <TextInput
                  style={styles.thresholdInput}
                  value={String(thresholds.autoPass)}
                  onChangeText={(text) => setThresholds({ ...thresholds, autoPass: parseInt(text) || 75 })}
                  keyboardType="numeric"
                />
                <Text style={styles.thresholdPlus}>+</Text>
              </View>
              <Text style={styles.tierAction}>Instant outreach</Text>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>🔍</Text>
              <Text style={styles.tierName}>Maybe</Text>
              <View style={styles.thresholdBox}>
                <TextInput
                  style={styles.thresholdInput}
                  value={String(thresholds.maybe)}
                  onChangeText={(text) => setThresholds({ ...thresholds, maybe: parseInt(text) || 50 })}
                  keyboardType="numeric"
                />
                <Text style={styles.thresholdPlus}>to {thresholds.autoPass - 1}</Text>
              </View>
              <Text style={styles.tierAction}>Human review</Text>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierEmoji}>❌</Text>
              <Text style={styles.tierName}>Fail</Text>
              <View style={styles.thresholdBox}>
                <Text style={styles.thresholdValue}>&lt; {thresholds.maybe}</Text>
              </View>
              <Text style={styles.tierAction}>Auto-discard</Text>
            </View>
          </View>

          {/* Criteria Breakdown */}
          <Text style={styles.sectionLabel}>Scoring Criteria</Text>

          {/* Must-Have */}
          <View style={styles.criteriaCard}>
            <View style={styles.criteriaHeader}>
              <Text style={styles.criteriaTitle}>📌 Must-Have Criteria</Text>
              <Text style={styles.criteriaSubtitle}>Any failure = instant fail</Text>
            </View>
            {icpConfig.mustHave.map((criterion, idx) => (
              <View key={idx} style={styles.criterionRow}>
                <View style={styles.criterionInfo}>
                  <Text style={styles.criterionField}>{criterion.field}</Text>
                  <Text style={styles.criterionValue}>{criterion.keywords?.join(', ') || `${criterion.min}-${criterion.max}`}</Text>
                </View>
                <Text style={styles.criterionPoints}>{criterion.weight}pts</Text>
              </View>
            ))}
          </View>

          {/* Strong Signals */}
          <View style={styles.criteriaCard}>
            <View style={styles.criteriaHeader}>
              <Text style={styles.criteriaTitle}>⚡ Strong Signals</Text>
              <Text style={styles.criteriaSubtitle}>Important but not mandatory</Text>
            </View>
            {icpConfig.strongSignals.map((criterion, idx) => (
              <View key={idx} style={styles.criterionRow}>
                <View style={styles.criterionInfo}>
                  <Text style={styles.criterionField}>{criterion.field}</Text>
                  <Text style={styles.criterionValue}>{criterion.keywords?.join(', ')}</Text>
                </View>
                <Text style={styles.criterionPoints}>{criterion.weight}pts</Text>
              </View>
            ))}
          </View>

          {/* Nice-to-Have */}
          <View style={styles.criteriaCard}>
            <View style={styles.criteriaHeader}>
              <Text style={styles.criteriaTitle}>✨ Nice-to-Have</Text>
              <Text style={styles.criteriaSubtitle}>Bonus points</Text>
            </View>
            {icpConfig.niceToHave.map((criterion, idx) => (
              <View key={idx} style={styles.criterionRow}>
                <View style={styles.criterionInfo}>
                  <Text style={styles.criterionField}>{criterion.field}</Text>
                  <Text style={styles.criterionValue}>{criterion.keywords?.join(', ')}</Text>
                </View>
                <Text style={styles.criterionPoints}>{criterion.weight}pts</Text>
              </View>
            ))}
          </View>

          {/* Test Tool */}
          <Text style={styles.sectionLabel}>Test Profile Scoring</Text>
          <TouchableOpacity style={styles.testButton} onPress={() => setShowTestModal(true)}>
            <Text style={styles.testButtonText}>🧪 Score a Test Profile</Text>
          </TouchableOpacity>

          {testResult && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultScore}>{testResult.score}</Text>
                <Text
                  style={[
                    styles.resultTier,
                    {
                      color:
                        testResult.tier === 'auto-pass'
                          ? '#22c55e'
                          : testResult.tier === 'maybe'
                            ? '#f59e0b'
                            : '#ef4444',
                    },
                  ]}
                >
                  {testResult.tier.toUpperCase()}
                </Text>
              </View>
              <View style={styles.reasonsList}>
                {testResult.reasons.map((reason, idx) => (
                  <Text key={idx} style={styles.reasonItem}>
                    {reason}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>💾 Save ICP Config</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESOURCES TAB */}
      {activeTab === 'resources' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>📚 Resource Library</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowResourceModal(true)}>
              <Text style={styles.addButtonText}>+ Add Resource</Text>
            </TouchableOpacity>
          </View>

          {resources.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No resources yet. Add your first resource!</Text>
            </View>
          ) : (
            resources.map((resource) => (
              <View key={resource.id} style={styles.resourceCard}>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <View style={styles.resourceMeta}>
                    <Text style={styles.resourceType}>{resource.type}</Text>
                    {resource.url && <Text style={styles.resourceUrl}>{resource.url}</Text>}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setResources(resources.filter((r) => r.id !== resource.id));
                  }}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>💾 Save Resources</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STRATEGY TAB */}
      {activeTab === 'strategy' && (
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How ICP Scoring Works</Text>
            <Text style={styles.infoText}>
              Each prospect is scored against your ideal customer profile. Scoring is transparent: you see exactly why each profile passes, fails,
              or needs review.
            </Text>

            <Text style={styles.infoSubtitle}>The Three Tiers</Text>
            <View style={styles.tierExplanation}>
              <View style={styles.tierExp}>
                <Text style={styles.tierExpEmoji}>✅</Text>
                <View>
                  <Text style={styles.tierExpTitle}>Auto-Pass (75+)</Text>
                  <Text style={styles.tierExpDesc}>Automatically queued for outreach. High likelihood of reply.</Text>
                </View>
              </View>
              <View style={styles.tierExp}>
                <Text style={styles.tierExpEmoji}>🔍</Text>
                <View>
                  <Text style={styles.tierExpTitle}>Maybe (50-74)</Text>
                  <Text style={styles.tierExpDesc}>Held for manual review. You decide whether to reach out.</Text>
                </View>
              </View>
              <View style={styles.tierExp}>
                <Text style={styles.tierExpEmoji}>❌</Text>
                <View>
                  <Text style={styles.tierExpTitle}>Fail (&lt;50)</Text>
                  <Text style={styles.tierExpDesc}>Automatically discarded. Low fit with your ICP.</Text>
                </View>
              </View>
            </View>

            <Text style={styles.infoSubtitle}>Tips for Tuning</Text>
            <Text style={styles.infoBullet}>• Test profiles to understand your scoring</Text>
            <Text style={styles.infoBullet}>• Adjust thresholds based on reply rates</Text>
            <Text style={styles.infoBullet}>• Update criteria as your market changes</Text>
          </View>
        </View>
      )}

      {/* Test Modal */}
      <Modal visible={showTestModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Test Profile Scoring</Text>
            <Text style={styles.modalSubtitle}>Enter prospect details to see how they'd be scored</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Founder, CEO, CFO"
                value={testProfile.title}
                onChangeText={(text) => setTestProfile({ ...testProfile, title: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Company Size</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 50, 200, 500"
                value={testProfile.company_size}
                onChangeText={(text) => setTestProfile({ ...testProfile, company_size: text })}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Industry</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., fintech, saas, tech"
                value={testProfile.industry}
                onChangeText={(text) => setTestProfile({ ...testProfile, industry: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Pain Point</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., cash flow, scaling, compliance"
                value={testProfile.painPoint}
                onChangeText={(text) => setTestProfile({ ...testProfile, painPoint: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowTestModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.scoreBtn]}
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

      {/* Resource Modal */}
      <Modal visible={showResourceModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Resource</Text>
            <Text style={styles.modalSubtitle}>Create a new resource for your library</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Resource Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Fundraising Playbook"
                value={newResource.name}
                onChangeText={(text) => setNewResource({ ...newResource, name: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeButtons}>
                {['ebook', 'guide', 'event', 'newsletter', 'product', 'template', 'webinar'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeButton,
                      newResource.type === t && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewResource({ ...newResource, type: t })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newResource.type === t && styles.typeButtonTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>URL (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., https://example.com/resource"
                value={newResource.url}
                onChangeText={(text) => setNewResource({ ...newResource, url: text })}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowResourceModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.scoreBtn]}
                onPress={() => {
                  if (newResource.name.trim()) {
                    setResources([...resources, { ...newResource, id: Date.now() }]);
                    setNewResource({ name: '', type: 'ebook', url: '' });
                    setShowResourceModal(false);
                  }
                }}
              >
                <Text style={styles.buttonText}>Add Resource</Text>
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
  header: { backgroundColor: '#0D9488', paddingHorizontal: 16, paddingVertical: 24 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#c8f9e4', marginTop: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#0D9488' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#0D9488', fontWeight: '600' },
  section: { padding: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 16, marginTop: 8 },
  overviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#0D9488' },
  overviewTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  overviewDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
  tiersGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  tierCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  tierEmoji: { fontSize: 28, marginBottom: 8 },
  tierName: { fontSize: 13, fontWeight: '600', color: '#000', marginBottom: 8 },
  thresholdBox: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, marginBottom: 8, alignItems: 'center' },
  thresholdInput: { width: '100%', fontSize: 16, fontWeight: '700', color: '#0D9488', textAlign: 'center', padding: 0, height: 24 },
  thresholdPlus: { fontSize: 12, color: '#999', marginTop: 2 },
  thresholdValue: { fontSize: 14, fontWeight: '700', color: '#0D9488', textAlign: 'center' },
  tierAction: { fontSize: 11, color: '#999', textAlign: 'center' },
  criteriaCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  criteriaHeader: { marginBottom: 12 },
  criteriaTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  criteriaSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  criterionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  criterionInfo: { flex: 1 },
  criterionField: { fontSize: 13, fontWeight: '600', color: '#000' },
  criterionValue: { fontSize: 12, color: '#666', marginTop: 2 },
  criterionPoints: { fontSize: 12, fontWeight: '700', color: '#0D9488', marginLeft: 8 },
  testButton: { backgroundColor: '#0D9488', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  testButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 2, borderColor: '#0D9488' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: '700', color: '#0D9488' },
  resultTier: { fontSize: 14, fontWeight: '700' },
  reasonsList: { gap: 6 },
  reasonItem: { fontSize: 13, color: '#333', lineHeight: 18 },
  saveButton: { backgroundColor: '#0D9488', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  infoSubtitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 8, marginTop: 12 },
  tierExplanation: { gap: 12, marginBottom: 16 },
  tierExp: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tierExpEmoji: { fontSize: 24 },
  tierExpTitle: { fontSize: 13, fontWeight: '600', color: '#000' },
  tierExpDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  infoBullet: { fontSize: 13, color: '#666', marginBottom: 6, marginLeft: 8 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', paddingBottom: 32, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#000', paddingHorizontal: 16, paddingTop: 20, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#666', paddingHorizontal: 16, marginBottom: 20 },
  formGroup: { paddingHorizontal: 16, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#000', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#000' },
  modalButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 20 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#e5e5e5' },
  scoreBtn: { backgroundColor: '#0D9488' },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addButton: { backgroundColor: '#0D9488', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 24 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center' },
  resourceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  resourceContent: { flex: 1 },
  resourceName: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 6 },
  resourceMeta: { flexDirection: 'row', gap: 8 },
  resourceType: { fontSize: 11, color: '#0D9488', fontWeight: '600', backgroundColor: '#e0f2f1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  resourceUrl: { fontSize: 11, color: '#666' },
  deleteBtn: { paddingHorizontal: 8 },
  deleteBtnText: { fontSize: 16 },
  typeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  typeButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  typeButtonActive: { backgroundColor: '#0D9488', borderColor: '#0D9488' },
  typeButtonText: { fontSize: 11, color: '#666' },
  typeButtonTextActive: { color: '#fff' },
});
