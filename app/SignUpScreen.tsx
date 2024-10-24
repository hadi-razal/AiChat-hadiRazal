import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

interface ImageAsset {
    uri: string;
    base64: string;
}

export default function SignupScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [image, setImage] = useState<ImageAsset | null>(null);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets?.[0]?.base64) {
                setImage({
                    uri: result.assets[0].uri,
                    base64: result.assets[0].base64,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error('Image picker error:', error);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!image?.base64 || !email) return null;

        try {
            setUploadingImage(true);
            const fileName = `${Date.now()}.jpg`;
            const filePath = `${email}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, decode(image.base64), {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image');
            console.error('Upload error:', error);
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        let profileImageUrl = null;
        if (image) {
            profileImageUrl = await uploadImage();
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    avatar_url: profileImageUrl,
                },
            },
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Account created successfully! Please check your email for verification.');
            router.push('/LoginScreen');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={StyleSheet.absoluteFillObject} />

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Create Account</Text>
                    </View>

                    {/* Profile Image Section */}
                    <View style={styles.profileImageContainer}>
                        <Pressable style={styles.imagePickerButton} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image.uri }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <Ionicons name="person-add" size={24} color="#CBD5E1" />
                                    <Text style={styles.placeholderText}>Add Profile Photo</Text>
                                </View>
                            )}
                        </Pressable>

                        {image && (
                            <Pressable style={styles.imageRemoveBtn} onPress={() => setImage(null)}>
                                <Ionicons
                                    name={'trash-bin'}
                                    size={20}
                                    color="#CBD5E1"
                                />
                            </Pressable>
                        )}

                    </View>

                    {/* Input Fields */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Full Name"
                                    placeholderTextColor="#CBD5E1"
                                    style={styles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor="#CBD5E1"
                                    keyboardType="email-address"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#CBD5E1"
                                    secureTextEntry={!isPasswordVisible}
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable style={styles.passwordToggle} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    <Ionicons
                                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#CBD5E1"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <Text style={styles.termsText}>
                            By signing up, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>

                        <Pressable
                            style={[
                                styles.button,
                                styles.signupButton,
                                uploadingImage && styles.buttonDisabled
                            ]}
                            onPress={handleSignUp}
                            disabled={uploadingImage}
                        >
                            <Text style={styles.buttonText}>
                                {uploadingImage ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </Pressable>

                        {/* Social Login */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialButtons}>
                            <Pressable style={styles.socialButton}>
                                <Ionicons name="logo-google" size={24} color="#fff" />
                            </Pressable>
                            <Pressable style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/LoginScreen')}>
                                <Text style={styles.loginLink}>Login</Text>
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
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    formContainer: {
        flex: 1,
        gap: 24,
    },
    profileImageContainer: {
        flexDirection: "column",
        gap: 15,
        position:"relative",
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
    },
    imagePickerButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    imageRemoveBtn: {
        marginTop: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#CBD5E1',
        fontSize: 10,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
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
    termsText: {
        color: '#CBD5E1',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    termsLink: {
        color: '#7C3AED',
    },
    button: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signupButton: {
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#CBD5E1',
        fontSize: 14,
    },
    loginLink: {
        color: '#7C3AED',
        fontSize: 14,
        fontWeight: '600',
    },
});
