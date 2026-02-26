import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TripsStackParamList } from '../navigation/TripsStackNavigator';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

type Trip = {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
};

type Props = NativeStackScreenProps<TripsStackParamList, 'TripsList'>;

export default function TripsScreen({ navigation }: Props) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchTrips();
        }, [])
    );

    const fetchTrips = async () => {
        try {
            const response = await fetch(`${API_URL}/trips`, {
                headers: {
                    'Bypass-Tunnel-Reminder': 'true',
                    'X-API-KEY': API_KEY
                }
            });
            const data = await response.json();
            setTrips(data);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Trip }) => (
        <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('TripDetails', { trip_id: item.id, trip_name: item.name })}
        >
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripDates}>{item.start_date} to {item.end_date}</Text>
            {item.description ? <Text style={styles.tripDesc}>{item.description}</Text> : null}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>My Trips</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTrip')}
                >
                    <Text style={styles.addButtonText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : trips.length === 0 ? (
                <Text style={styles.subtitle}>No trips planned yet.</Text>
            ) : (
                <FlatList
                    data={trips}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        paddingTop: 48,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 40,
    },
    listContainer: {
        paddingBottom: 24,
    },
    tripCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tripName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    tripDates: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
        marginBottom: 6,
    },
    tripDesc: {
        fontSize: 14,
        color: '#666',
    },
});
