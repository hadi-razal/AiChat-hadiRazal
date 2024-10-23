import { StyleSheet, Text, View, Pressable, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#1A1A2E', '#16213E', '#0F3460']}
                style={StyleSheet.absoluteFill}
            />

            {/* Main Content */}
            <View style={styles.contentWrapper}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#4C1D95', '#7C3AED']}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="chatbubbles" size={40} color="#fff" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>AiChat</Text>
                    <Text style={styles.subtitle}>
                        Experience the next generation of AI-powered conversations
                    </Text>
                </View>

                <View style={styles.featuresContainer}>
                    {[
                        { icon: 'bulb-outline', text: 'Advanced AI Technology' }, 
                        { icon: 'time', text: '24/7 Instant Response' },
                        { icon: 'shield-checkmark', text: 'Secure & Private' },
                    ].map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <Ionicons name={feature.icon as any} size={24} color="#7C3AED" />
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>


                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={() => router.push('/SignUpScreen')}
                        style={({ pressed }) => [
                            styles.button,
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/LoginScreen')}
                        style={({ pressed }) => [
                            styles.button,
                            styles.secondaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.secondaryButtonText}>Already have an account?</Text>
                    </Pressable>
                </View>

                <View style={styles.madeByContainer}>
                    <Text style={styles.madeByText}>Made By Hadi Razal</Text>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#CBD5E1',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '80%',
    },
    featuresContainer: {
        marginTop: 48,
        gap: 16,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    featureText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonContainer: {
        gap: 12,
        marginTop: 48,
    },
    button: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#7C3AED',
        flexDirection: 'row',
        gap: 8,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#CBD5E1',
        fontSize: 14,
        fontWeight: '500',
    },
    madeByContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    madeByText: {
        textAlign: 'center',
        fontSize: 10,
        color: "rgba(255,255,255,0.30)" 
    },
});