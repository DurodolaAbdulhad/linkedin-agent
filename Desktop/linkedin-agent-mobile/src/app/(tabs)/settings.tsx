import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Coming soon</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>API Configuration</Text>
            <Text style={styles.settingSubtitle}>Set your backend URL</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Account</Text>
            <Text style={styles.settingSubtitle}>Manage your settings</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>About</Text>
            <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>App Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Week 3</Text>
            <Text style={styles.statLabel}>Phase</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Expo</Text>
            <Text style={styles.statLabel}>Platform</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Node.js</Text>
            <Text style={styles.statLabel}>Backend</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Ollama</Text>
            <Text style={styles.statLabel}>LLM</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#001A3D',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  settingArrow: {
    fontSize: 18,
    color: '#0D9488',
    marginLeft: 12,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});
