import { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Image,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface UserProfile {
    username: string;
    email: string;
    avatar_url: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [userProfile] = useState<UserProfile>({
        username: "John Doe",
        email: "john.doe@example.com",
        avatar_url: 'https://via.placeholder.com/100',
    });

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: 'destructive',
                    onPress: () => {
                        supabase.auth.signOut()
                        router.replace('/');
                    }
                }
            ]
        );
    };
    

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userProfile.avatar_url }}
                            style={styles.avatar}
                        />
                        <View style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Username</Text>
                            <Text style={styles.infoValue}>{userProfile.username}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{userProfile.email}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionsSection}>
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => Alert.alert('Edit Profile', 'Edit profile functionality to be implemented.')}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.actionButton, styles.actionButtonDanger]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                            Logout
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#7C3AED',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7C3AED',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#1A1A2E',
    },
    infoSection: {
        width: '100%',
        gap: 16,
    },
    infoItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    actionsSection: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    actionButtonDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    actionButtonTextDanger: {
        color: '#EF4444',
    },
});