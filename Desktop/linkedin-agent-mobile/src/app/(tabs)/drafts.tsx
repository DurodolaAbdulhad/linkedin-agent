import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getDMs, sendDM, getProfiles, type DM, type Profile } from '@/api/client';

export default function Drafts() {
  const [dms, setDMs] = useState<DM[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [dmsData, profilesData] = await Promise.all([getDMs(), getProfiles()]);
      setDMs(dmsData);
      setProfiles(profilesData);
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

  const handleSendDM = async (dmId: number) => {
    setSendingId(dmId);
    try {
      await sendDM(dmId);
      alert('DM sent!');
      fetchData();
    } catch (error) {
      console.error('Failed to send DM:', error);
      alert('Failed to send DM');
    } finally {
      setSendingId(null);
    }
  };

  const getProfileName = (profileId: number) => {
    const profile = profiles.find((p) => p._id === profileId);
    return profile?.name || `Profile ${profileId}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const draftDMs = dms.filter((dm) => dm.status === 'draft');
  const sentDMs = dms.filter((dm) => dm.status === 'sent');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drafts</Text>
        <Text style={styles.headerSubtitle}>Review and send DMs</Text>
      </View>

      {draftDMs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready to Send ({draftDMs.length})</Text>

          {draftDMs.map((dm) => (
            <View key={dm._id} style={styles.dmCard}>
              <Text style={styles.dmProfile}>{getProfileName(dm.profileId)}</Text>

              <View style={styles.dmTextContainer}>
                <Text style={styles.dmText}>"{dm.dmText}"</Text>
              </View>

              <TouchableOpacity
                style={[styles.sendButton, sendingId === dm._id && styles.sendButtonLoading]}
                onPress={() => handleSendDM(dm._id)}
                disabled={sendingId === dm._id}
              >
                <Text style={styles.sendButtonText}>
                  {sendingId === dm._id ? 'Sending...' : 'Send DM'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {sentDMs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sent ({sentDMs.length})</Text>

          {sentDMs.map((dm) => (
            <View key={dm._id} style={[styles.dmCard, styles.sentCard]}>
              <Text style={styles.dmProfile}>{getProfileName(dm.profileId)}</Text>

              <View style={styles.dmTextContainer}>
                <Text style={styles.dmText}>"{dm.dmText}"</Text>
              </View>

              <View style={styles.sentBadge}>
                <Text style={styles.sentBadgeText}>✓ Sent</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {dms.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No DMs yet.</Text>
          <Text style={styles.emptySubtext}>Generate one from the Profiles tab!</Text>
        </View>
      )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 12,
  },
  dmCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  sentCard: {
    backgroundColor: '#F9F9F9',
  },
  dmProfile: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 10,
  },
  dmTextContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dmText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  sendButton: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  sendButtonLoading: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  sentBadge: {
    backgroundColor: '#E8F5F3',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sentBadgeText: {
    color: '#0D9488',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
