import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getProfiles, getDMs, type Profile, type DM } from '@/api/client';

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dms, setDMs] = useState<DM[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [profilesData, dmsData] = await Promise.all([getProfiles(), getDMs()]);
      setProfiles(profilesData);
      setDMs(dmsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const sentDMs = dms.filter(dm => dm.status === 'sent').length;
  const draftDMs = dms.length - sentDMs;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LinkedIn Agent</Text>
        <Text style={styles.headerSubtitle}>Consulting pipeline</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Profiles</Text>
          <Text style={styles.metricValue}>{profiles.length}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>DMs Generated</Text>
          <Text style={styles.metricValue}>{dms.length}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Sent</Text>
          <Text style={styles.metricValue}>{sentDMs}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Drafts</Text>
          <Text style={styles.metricValue}>{draftDMs}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {profiles.length === 0 ? (
          <Text style={styles.emptyText}>No profiles yet. Add one to get started!</Text>
        ) : (
          <View style={styles.activityList}>
            {profiles.slice(0, 3).map((profile) => (
              <View key={profile._id} style={styles.activityItem}>
                <Text style={styles.activityName}>{profile.name}</Text>
                <Text style={styles.activitySubtitle}>
                  {profile.title} at {profile.company}
                </Text>
                <Text style={styles.activityPain}>Pain: {profile.painPoint}</Text>
              </View>
            ))}
          </View>
        )}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D9488',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activityPain: {
    fontSize: 12,
    color: '#666',
  },
});
