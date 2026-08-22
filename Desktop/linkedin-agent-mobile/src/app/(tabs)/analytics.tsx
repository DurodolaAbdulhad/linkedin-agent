import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function Analytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/dashboard`, {
        timeout: 10000,
      });
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
      </View>
    );
  }

  const { summary, campaigns } = dashboard;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>Real-time campaign performance</Text>
      </View>

      {/* Summary Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Campaigns</Text>
          <Text style={styles.metricValue}>{summary.campaigns}</Text>
          <Text style={styles.metricSubtitle}>{summary.activeCampaigns} active</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Conversions</Text>
          <Text style={styles.metricValue}>{summary.totalConversions}</Text>
          <Text style={styles.metricSubtitle}>Total</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Meetings</Text>
          <Text style={styles.metricValue}>{summary.totalMeetings}</Text>
          <Text style={styles.metricSubtitle}>Booked</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Deals Won</Text>
          <Text style={styles.metricValue}>{summary.totalDeals}</Text>
          <Text style={styles.metricSubtitle}>Closed</Text>
        </View>
      </View>

      {/* Revenue Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue</Text>
        <View style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>
              ${Math.round(summary.totalRevenue).toLocaleString()}
            </Text>
          </View>
          <View style={styles.revenueRow}>
            <Text style={styles.revenueLabel}>Avg Deal Size</Text>
            <Text style={styles.revenueValue}>
              ${Math.round(summary.averageDealSize).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Campaigns Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campaign Performance</Text>
        {campaigns.map((campaign: any) => (
          <View key={campaign.id} style={styles.campaignCard}>
            <Text style={styles.campaignName}>{campaign.profile}</Text>
            <Text style={styles.campaignStage}>Stage {campaign.stage}/7</Text>

            <View style={styles.campaignMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Conversions</Text>
                <Text style={styles.metricItemValue}>{campaign.metrics.totalConversions}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Meetings</Text>
                <Text style={styles.metricItemValue}>{campaign.metrics.meetings}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricItemLabel}>Revenue</Text>
                <Text style={styles.metricItemValue}>
                  ${Math.round(campaign.metrics.revenue).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
    padding: 14,
    marginHorizontal: 8,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0D9488',
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
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
  revenueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
  },
  campaignCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001A3D',
    marginBottom: 4,
  },
  campaignStage: {
    fontSize: 12,
    color: '#0D9488',
    marginBottom: 10,
    fontWeight: '500',
  },
  campaignMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricItemLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  metricItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001A3D',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
