import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <Stack.Screen options={{ headerShown: false }} />

                {/* Background Gradient */}
                <LinearGradient
                    colors={['#1A1A2E', '#16213E', '#0F3460']}
                    style={StyleSheet.absoluteFill}
                />

                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => router.push('/')}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                        <Text style={styles.welcomeSubtitle}>
                            We're excited to have you back. Please login to continue.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {/* Input Fields */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor="#CBD5E1"
                                    keyboardType="email-address"
                                    style={styles.input}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#CBD5E1"
                                    secureTextEntry
                                    style={styles.input}
                                />
                                <Pressable style={styles.passwordToggle} onPress={() => {}}>
                                    <Ionicons name="eye-outline" size={20} color="#CBD5E1" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <Pressable style={styles.forgotPasswordContainer} onPress={() => router.push('/')}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </Pressable>

                        {/* Login Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                styles.loginButton,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={() => router.push('/')}
                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </Pressable>

                        {/* Social Login Options */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtons}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.socialButton,
                                    pressed && styles.buttonPressed,
                                ]}
                            >
                                <Ionicons name="logo-google" size={24} color="#fff" />
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.socialButton,
                                    pressed && styles.buttonPressed,
                                ]}
                            >
                                <Ionicons name="logo-apple" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <Pressable onPress={() => router.push('/SignUpScreen')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    welcomeSection: {
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#CBD5E1',
        lineHeight: 24,
    },
    formContainer: {
        flex: 1,
        gap: 24,
    },
    inputGroup: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
    passwordToggle: {
        padding: 8,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        color: '#7C3AED',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        backgroundColor: '#7C3AED',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(203, 213, 225, 0.3)',
    },
    dividerText: {
        color: '#CBD5E1',
        fontSize: 14,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#CBD5E1',
        fontSize: 14,
    },
    signupLink: {
        color: '#7C3AED',
        fontSize: 14,
        fontWeight: '600',
    },
});
