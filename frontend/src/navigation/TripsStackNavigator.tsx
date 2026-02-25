import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TripsScreen from '../screens/TripsScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import AddTripScreen from '../screens/AddTripScreen';

export type TripsStackParamList = {
    TripsList: undefined;
    TripDetails: { trip_id: number; trip_name: string };
    AddTrip: undefined;
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export default function TripsStackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="TripsList"
                component={TripsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TripDetails"
                component={TripDetailsScreen}
                options={({ route }) => ({ title: route.params.trip_name })}
            />
            <Stack.Screen
                name="AddTrip"
                component={AddTripScreen}
                options={{ title: 'Create New Trip' }}
            />
        </Stack.Navigator>
    );
}
