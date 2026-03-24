import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ['repair', 'cleaning', 'delivery', 'installation', 'maintenance'];

export default function CreateTaskScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [budget, setBudget] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    
    // Location state
    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState({
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    
    // Date Time state
    const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

        const [showAccTimePicker, setShowAccTimePicker] = useState(false);

    // Images state
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setRegion({
                ...region,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            
            // Reverse geocode
            let geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            if (geocode && geocode.length > 0) {
                const addr = geocode[0];
                setLocationName(`${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim());
            }
        })();
    }, []);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDeadline(selectedDate);
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) setDeadline(selectedTime);
    };

    
    const handleMapPress = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setRegion({ ...region, latitude, longitude });
        
        // Reverse geocoding for selected point
        let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
            const addr = geocode[0];
            let addrString = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim();
            if (addrString.startsWith(',')) addrString = addrString.substring(1).trim();
            setLocationName(addrString || 'Custom Location');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        }
    };

    const takePhoto = async () => {
        let { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access camera was denied');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0]]);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (!title || !description || !budget) {
            Alert.alert('Error', 'Please fill in all required fields (title, description, budget)');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('budget', budget);
            formData.append('isEmergency', String(isEmergency));
            formData.append('deadline', deadline.toISOString());
            formData.append('locationName', locationName || 'Pinned Location');
            formData.append('locationLat', String(region.latitude));
            formData.append('locationLng', String(region.longitude));
            formData.append('requiresLocation', 'true');

            // Append each image as a file
            if (images.length > 0) {
                images.forEach((img, index) => {
                    const localUri = Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri;
                    formData.append('beforeImages', {
                        uri: localUri,
                        type: img.mimeType || 'image/jpeg',
                        name: img.fileName || `image-${index}.jpg`,
                    } as any);
                });
            }

            await api.post('/tasks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            Alert.alert('Success', 'Task created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50"
        >
            <ScrollView className="flex-1 p-4">
                <View className="mb-6 flex-row items-center justify-between">
                    <Text className="text-3xl font-bold">Create Task</Text>
                    <TouchableOpacity onPress={() => router.back()} className="px-3 py-2 bg-gray-200 rounded">
                        <Text className="text-gray-700 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4"
                        placeholder="What needs to be done?"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Description *</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 h-24 mb-4"
                        placeholder="Provide details about the task..."
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Task Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        <TouchableOpacity 
                            onPress={pickImage}
                            className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mr-3"
                        >
                            <Text className="text-gray-500 font-bold text-2xl">+</Text>
                            <Text className="text-gray-500 text-xs mt-1">Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={takePhoto}
                            className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mr-3"
                        >
                            <Text className="text-gray-500 font-bold text-2xl">📷</Text>
                            <Text className="text-gray-500 text-xs mt-1">Camera</Text>
                        </TouchableOpacity>
                        {images.map((img, idx) => (
                            <View key={idx} className="w-24 h-24 rounded-lg overflow-hidden mr-3 relative">
                                <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} />
                                <TouchableOpacity 
                                    onPress={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                                >
                                    <Text className="text-white text-xs font-bold">X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Budget (₹) *</Text>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4"
                        placeholder="e.g. 50"
                        keyboardType="numeric"
                        value={budget}
                        onChangeText={setBudget}
                    />

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        <View className="flex-row gap-2">
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity 
                                    key={cat} 
                                    onPress={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-300'}`}
                                >
                                    <Text className={`capitalize font-medium ${category === cat ? 'text-white' : 'text-gray-600'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-sm font-semibold text-gray-700">Emergency</Text>
                            <Text className="text-xs text-gray-500">Needs immediate attention</Text>
                        </View>
                        <Switch value={isEmergency} onValueChange={setIsEmergency} />
                    </View>
                    
                    <View className="h-px bg-gray-200 my-4" />

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Deadline</Text>
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg items-center"
                        >
                            <Text>{deadline.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setShowTimePicker(true)}
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg items-center"
                        >
                            <Text>{deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={deadline}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                    {showTimePicker && (
                        <DateTimePicker
                            value={deadline}
                            mode="time"
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}



                    <View className="h-px bg-gray-200 my-4" />

                    <Text className="text-sm font-semibold text-gray-700 mb-2">Location Pin (Map Tap or Drag Pin to adjust)</Text>
                    <View className="h-48 rounded-lg overflow-hidden mb-2 border border-gray-200">
                        <MapView
                            style={{ flex: 1 }}
                            region={region}
                            onPress={handleMapPress}
                        >
                            <Marker 
                                coordinate={region} 
                                draggable 
                                onDragEnd={handleMapPress}
                            />
                        </MapView>
                    </View>
                    <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-6"
                        placeholder="Location Details (Will auto-fill on pin)"
                        value={locationName}
                        onChangeText={setLocationName}
                    />

                    <TouchableOpacity 
                        onPress={handleSubmit} 
                        disabled={loading}
                        className={`flex-1 py-4 rounded-lg flex-row items-center justify-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    >
                        {loading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                        <Text className="text-white font-bold text-lg">Create Task</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}