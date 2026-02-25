import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'https://eager-doodles-read.loca.lt';

type Category = { id: number; name: string };
type Trip = { id: number; name: string };

export default function AddExpenseScreen() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [catRes, tripRes] = await Promise.all([
                fetch(`${API_URL}/categories`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } }),
                fetch(`${API_URL}/trips`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } })
            ]);

            const catData = await catRes.json();
            const tripData = await tripRes.json();

            setCategories(catData);
            setTrips(tripData);

            if (catData.length > 0) setSelectedCategory(catData[0].id);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid expense amount greater than 0.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please provide a short description.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Missing Category', 'Please select a category.');
            return;
        }

        setLoading(true);

        try {
            const date = new Date().toISOString().split('T')[0];

            const payload = {
                amount: parseFloat(amount),
                description: description.trim(),
                date: date,
                category_id: selectedCategory,
                trip_id: selectedTrip === 0 || selectedTrip === null ? undefined : selectedTrip
            };

            const response = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to create expense');
            }

            Alert.alert('Success', 'Expense logged successfully!');

            setAmount('');
            setDescription('');
            if (categories.length > 0) setSelectedCategory(categories[0].id);
            setSelectedTrip(null);
        } catch (error) {
            console.error('Error logging expense:', error);
            Alert.alert('Submission Error', 'Could not save the expense.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add Expense</Text>

            <View style={styles.formCard}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="What was this for?"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    >
                        {categories.map((cat) => (
                            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Tag to Trip (Optional)</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedTrip}
                        onValueChange={(itemValue) => setSelectedTrip(itemValue)}
                    >
                        <Picker.Item label="None (General Expense)" value={null} />
                        {trips.map((trip) => (
                            <Picker.Item key={trip.id} label={trip.name} value={trip.id} />
                        ))}
                    </Picker>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Log Expense</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#000',
    },
    formCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 40,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        overflow: 'hidden',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
