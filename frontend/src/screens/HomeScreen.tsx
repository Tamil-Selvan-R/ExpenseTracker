import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, SectionList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://eager-doodles-read.loca.lt';

type Expense = {
  id: number;
  amount: number;
  description: string;
  date: string;
  category?: { id: number; name: string };
  trip?: { id: number; name: string };
};

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to remove this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
              });
              setExpenses(prev => prev.filter(e => e.id !== id));
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Could not delete expense.');
            }
          }
        }
      ]
    );
  };

  // Derived state for Dashboard Summary
  const { totalSpend, tripSpend, generalSpend, groupedExpenses } = useMemo(() => {
    let general = 0;
    let trip = 0;
    const groups: Record<string, Expense[]> = {};

    expenses.forEach(exp => {
      if (exp.trip) trip += exp.amount;
      else general += exp.amount;

      if (!groups[exp.date]) groups[exp.date] = [];
      groups[exp.date].push(exp);
    });

    const sections = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        title: date,
        data: groups[date]
      }));

    return {
      totalSpend: general + trip,
      tripSpend: trip,
      generalSpend: general,
      groupedExpenses: sections
    };
  }, [expenses]);

  const getCategoryIcon = (categoryName?: string): keyof typeof Ionicons.glyphMap => {
    if (!categoryName) return 'help-circle-outline';
    switch (categoryName.toLowerCase()) {
      case 'commute': return 'car-outline';
      case 'food & drink': return 'fast-food-outline';
      case 'groceries': return 'cart-outline';
      case 'lifestyle': return 'shirt-outline';
      case 'social': return 'people-outline';
      case 'fixed': return 'home-outline';
      default: return 'cash-outline';
    }
  };

  const renderHeader = () => (
    <View style={styles.dashboardCard}>
      <Text style={styles.dashboardTitle}>Monthly Insights</Text>
      <Text style={styles.dashboardTotal}>₹{totalSpend.toFixed(2)}</Text>
      <Text style={styles.dashboardSubtitle}>Total Spend</Text>

      <View style={styles.splitContainer}>
        <View style={styles.splitBox}>
          <Text style={styles.splitLabel}>General</Text>
          <Text style={styles.splitAmount}>₹{generalSpend.toFixed(2)}</Text>
        </View>
        <View style={styles.splitDivider} />
        <View style={styles.splitBox}>
          <Text style={styles.splitLabel}>Trip Tagged</Text>
          <Text style={styles.splitAmount}>₹{tripSpend.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity onLongPress={() => handleDelete(item.id)} style={styles.expenseCard}>
      <View style={styles.expenseRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={getCategoryIcon(item.category?.name)} size={24} color="#007AFF" />
        </View>
        <View style={styles.expenseBody}>
          <View style={styles.expenseHeaderRow}>
            <Text style={styles.expenseCategory}>{item.category?.name || 'Uncategorized'}</Text>
            {item.trip && (
              <View style={styles.tripBadge}>
                <Text style={styles.tripBadgeText}>{item.trip.name.substring(0, 15)}...</Text>
              </View>
            )}
          </View>
          <Text style={styles.expenseDesc} numberOfLines={1}>{item.description}</Text>
        </View>
      </View>
      <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : expenses.length === 0 ? (
        <>
          {renderHeader()}
          <Text style={styles.emptyText}>No expenses logged this month.</Text>
        </>
      ) : (
        <SectionList
          sections={groupedExpenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          stickySectionHeadersEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 40,
  },
  dashboardCard: {
    backgroundColor: '#007AFF',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 60, // accommodate safe area
  },
  dashboardTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dashboardTotal: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  dashboardSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 24,
  },
  splitContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  splitBox: {
    flex: 1,
    alignItems: 'center',
  },
  splitDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  splitLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  splitAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expenseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseBody: {
    flex: 1,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  tripBadge: {
    backgroundColor: '#E5F0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tripBadgeText: {
    color: '#007AFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expenseDesc: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 12,
  },
});
