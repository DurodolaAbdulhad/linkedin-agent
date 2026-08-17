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
  Picker,
} from 'react-native';
import { getProfiles, addProfile, generateDM, type Profile, type DM } from '@/api/client';

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
    painPoint: 'fundraising',
  });

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

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.painPoint}
            onValueChange={(value) => setFormData({ ...formData, painPoint: value })}
            style={styles.picker}
          >
            <Picker.Item label="GTM Strategy" value="GTM strategy" />
            <Picker.Item label="Fundraising" value="fundraising" />
            <Picker.Item label="Financial Clarity" value="financial clarity" />
            <Picker.Item label="Compliance" value="compliance" />
          </Picker>
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
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileSubtitle}>
                {profile.title} at {profile.company}
              </Text>
              <Text style={styles.profilePain}>Pain point: {profile.painPoint}</Text>

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
  pickerContainer: {
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#333',
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
  generateButton: {
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
});
