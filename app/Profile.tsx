import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface UserProfile {
    username: string;
    email: string;
    profile: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        username: "",
        email: "",
        profile: ""
    });

    const getUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            if (!user) {
                throw new Error('No authenticated user found');
            }

            const { data, error: profileError } = await supabase
                .from("users")
                .select("name, email, profile")
                .eq("email", user.email)
                .single();
                
            if (profileError) throw profileError;

            setUserProfile({
                username: data.name || user.email?.split('@')[0] || 'Anonymous',
                email: user.email || '',
                profile: data.profile || ''
            });
        } catch (error: any) {
            console.error("Error fetching user profile:", error?.message);
            setError(error?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserProfile();
    }, []);

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
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) throw error;
                            router.replace('/');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderAvatar = () => {
        if (userProfile.profile) {
            return (
                <Image
                    source={{ uri: userProfile.profile }}
                    style={styles.avatar}
                />
            );
        }

        return (
            <LinearGradient
                colors={['#7C3AED', '#9F7AEA']}
                style={styles.avatar}
            >
                <Ionicons name="person" size={60} color="#fff" />
            </LinearGradient>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <LinearGradient
                colors={['#1A1A2E', '#2A2A3E']}
                style={styles.gradientBackground}
            >
                <View style={styles.header}>
                    <Pressable 
                        style={styles.backButton} 
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable
                            style={styles.retryButton}
                            onPress={getUserProfile}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                {renderAvatar()}
                            </View>

                            <View style={styles.infoSection}>
                                <View style={styles.infoCard}>
                                    <View style={styles.infoHeader}>
                                        <Ionicons name="person" size={20} color="#7C3AED" />
                                        <Text style={styles.infoLabel}>Username</Text>
                                    </View>
                                    <Text style={styles.infoValue}>{userProfile.username}</Text>
                                </View>

                                <View style={styles.infoCard}>
                                    <View style={styles.infoHeader}>
                                        <Ionicons name="mail" size={20} color="#7C3AED" />
                                        <Text style={styles.infoLabel}>Email</Text>
                                    </View>
                                    <Text style={styles.infoValue}>{userProfile.email}</Text>
                                </View>

                                <View style={styles.infoCard}>
                                    <View style={styles.infoHeader}>
                                        <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
                                        <Text style={styles.infoLabel}>Account Status</Text>
                                    </View>
                                    <Text style={styles.infoValue}>Active</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionsSection}>
                            <Pressable
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                                <Text style={styles.logoutButtonText}>
                                    Logout
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    gradientBackground: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 2,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
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
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
    },
    infoSection: {
        width: '100%',
        gap: 16,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    actionsSection: {
        gap: 16,
        marginTop: 'auto',
        paddingBottom: 24,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    logoutButtonText: {
        color: '#EF4444',
        fontSize: 18,
        fontWeight: '600',
    },
});