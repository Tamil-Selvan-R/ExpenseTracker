import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TripsStackParamList } from '../navigation/TripsStackNavigator';

const API_URL = 'https://eager-doodles-read.loca.lt';

type Props = NativeStackScreenProps<TripsStackParamList, 'TripDetails'>;

type TripSummary = {
    trip_id: number;
    trip_name: string;
    total_spent: number;
    category_breakdown: Record<string, number>;
};

export default function TripDetailsScreen({ route }: Props) {
    const { trip_id } = route.params;
    const [summary, setSummary] = useState<TripSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [trip_id]);

    const fetchSummary = async () => {
        try {
            const response = await fetch(`${API_URL}/trips/${trip_id}/summary`, {
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching trip summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!summary) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Could not load trip details.</Text>
            </View>
        );
    }

    const categories = Object.keys(summary.category_breakdown);

    return (
        <View style={styles.container}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Spent</Text>
                <Text style={styles.summaryTotal}>₹{summary.total_spent.toFixed(2)}</Text>
            </View>

            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categories.length === 0 ? (
                <Text style={styles.emptyText}>No expenses logged for this trip yet.</Text>
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={styles.categoryCard}>
                            <Text style={styles.categoryName}>{item}</Text>
                            <Text style={styles.categoryTotal}>₹{summary.category_breakdown[item].toFixed(2)}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    summaryCard: {
        backgroundColor: '#007AFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    summaryTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    summaryTotal: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    categoryTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    }
});
