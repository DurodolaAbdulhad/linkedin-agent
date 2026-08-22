import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { getProfiles, addProfile, generateDM, createCampaign, type Profile, type DM } from '@/api/client';

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    painPoint: 'fundraising' as string,
    twitterHandle: '',
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ LinkedIn: boolean; Twitter: boolean }>({
    LinkedIn: true,
    Twitter: false,
  });
  const [campaigningId, setCampaigningId] = useState<number | null>(null);
  const [icpScores, setIcpScores] = useState<{ [key: number]: any }>({});

  const painPointOptions = ['GTM strategy', 'fundraising', 'financial clarity', 'compliance'];

  const fetchProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfiles();
  };

  const handleAddProfile = async () => {
    if (!formData.name || !formData.title || !formData.company) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addProfile(formData);
      setFormData({ name: '', title: '', company: '', painPoint: 'fundraising' });
      fetchProfiles();
    } catch (error) {
      console.error('Failed to add profile:', error);
      alert('Failed to add profile');
    }
  };

  const handleGenerateDM = async (profile: Profile) => {
    setGeneratingId(profile._id);
    try {
      await generateDM(profile);
      alert('DM generated! Check the Drafts tab.');
      fetchProfiles();
    } catch (error) {
      console.error('Failed to generate DM:', error);
      alert('Failed to generate DM');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleStartCampaign = async (profile: Profile) => {
    setCampaigningId(profile._id);
    try {
      const result = await createCampaign(profile._id, 'LinkedIn');
      setIcpScores({ ...icpScores, [profile._id]: result.icpScore });
      alert(`Campaign started! ICP Fit: ${result.icpScore.fitLevel} (${result.icpScore.score}/100)`);
    } catch (error) {
      console.error('Failed to start campaign:', error);
      alert('Failed to start campaign');
    } finally {
      setCampaigningId(null);
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profiles</Text>
        <Text style={styles.headerSubtitle}>Manage your LinkedIn targets</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Company"
          value={formData.company}
          onChangeText={(text) => setFormData({ ...formData, company: text })}
          placeholderTextColor="#999"
        />

        <Text style={styles.selectLabel}>Platforms:</Text>
        <View style={styles.platformRow}>
          <TouchableOpacity
            style={[
              styles.platformButton,
              selectedPlatforms.LinkedIn && styles.platformButtonActive,
            ]}
            onPress={() => setSelectedPlatforms({ ...selectedPlatforms, LinkedIn: !selectedPlatforms.LinkedIn })}
          >
            <Text style={[styles.platformButtonText, selectedPlatforms.LinkedIn && styles.platformButtonTextActive]}>
              LinkedIn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.platformButton,
              selectedPlatforms.Twitter && styles.platformButtonActive,
            ]}
            onPress={() => setSelectedPlatforms({ ...selectedPlatforms, Twitter: !selectedPlatforms.Twitter })}
          >
            <Text style={[styles.platformButtonText, selectedPlatforms.Twitter && styles.platformButtonTextActive]}>
              Twitter/X
            </Text>
          </TouchableOpacity>
        </View>

        {selectedPlatforms.Twitter && (
          <TextInput
            style={styles.input}
            placeholder="Twitter handle (@username)"
            value={formData.twitterHandle}
            onChangeText={(text) => setFormData({ ...formData, twitterHandle: text })}
            placeholderTextColor="#999"
          />
        )}

        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Pain Point:</Text>
          <View style={styles.selectButtonsRow}>
            {painPointOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectButton,
                  formData.painPoint === option && styles.selectButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, painPoint: option })}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    formData.painPoint === option && styles.selectButtonTextActive,
                  ]}
                >
                  {option.slice(0, 8)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
          <Text style={styles.addButtonText}>+ Add Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profilesList}>
        <Text style={styles.sectionTitle}>Profiles ({profiles.length})</Text>

        {profiles.length === 0 ? (
          <Text style={styles.emptyText}>No profiles yet. Add one above!</Text>
        ) : (
          profiles.map((profile) => (
            <View key={profile._id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileSubtitle}>
                    {profile.title} at {profile.company}
                  </Text>
                </View>
                {icpScores[profile._id] && (
                  <View style={[
                    styles.icpBadge,
                    icpScores[profile._id].fitLevel === 'High' ? styles.icpHigh :
                    icpScores[profile._id].fitLevel === 'Medium' ? styles.icpMedium :
                    styles.icpLow
                  ]}>
                    <Text style={styles.icpBadgeText}>{icpScores[profile._id].fitLevel}</Text>
                    <Text style={styles.icpScore}>{Math.round(icpScores[profile._id].score)}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.profilePain}>Pain point: {profile.painPoint}</Text>

              <View style={styles.platformBadges}>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>🔗 LinkedIn</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    generatingId === profile._id && styles.generateButtonLoading,
                  ]}
                  onPress={() => handleGenerateDM(profile)}
                  disabled={generatingId === profile._id}
                >
                  <Text style={styles.generateButtonText}>
                    {generatingId === profile._id ? 'Generating...' : 'Generate DM'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.campaignButton,
                    campaigningId === profile._id && styles.campaignButtonLoading,
                  ]}
                  onPress={() => handleStartCampaign(profile)}
                  disabled={campaigningId === profile._id}
                >
                  <Text style={styles.campaignButtonText}>
                    {campaigningId === profile._id ? 'Starting...' : 'Start Campaign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  formContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 12,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  selectContainer: {
    marginBottom: 12,
  },
  selectLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  selectButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: '22%',
  },
  selectButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  selectButtonText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  platformButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  platformButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  platformButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  platformButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  profilesList: {
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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  profilePain: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  icpBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 50,
  },
  icpHigh: {
    backgroundColor: '#E8F5E9',
  },
  icpMedium: {
    backgroundColor: '#FFF3E0',
  },
  icpLow: {
    backgroundColor: '#FFEBEE',
  },
  icpBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#001A3D',
  },
  icpScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#001A3D',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  generateButtonLoading: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  campaignButton: {
    flex: 1,
    backgroundColor: '#0D9488',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  campaignButtonLoading: {
    opacity: 0.6,
  },
  campaignButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  platformBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  platformBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  platformBadgeText: {
    fontSize: 11,
    color: '#001A3D',
    fontWeight: '500',
  },
});
