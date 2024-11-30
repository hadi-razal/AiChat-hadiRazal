import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { format } from "date-fns";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  ChatSession,
} from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

// Types
interface UserProfile {
  id: string;
  avatar_url?: string;
  username?: string;
  email?: string;
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  avatar: string;
  error?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

interface SkeletonBubbleProps {
  width?: number;
  lines?: number;
}

// Constants
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const DEFAULT_AVATAR = "https://via.placeholder.com/40";
const AI_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM3QzNBRUQiLz4KICA8cGF0aCBkPSJNNjAgODBMMTQwIDgwTDE0MCAxNDBMNjAgMTQwTDYwIDgwWiIgZmlsbD0iI0ZGRiIvPgogIDxjaXJjbGUgY3g9IjgwIiBjeT0iMTEwIiByPSIxMCIgZmlsbD0iIzdDM0FFRCIvPgogIDxjaXJjbGUgY3g9IjEyMCIgY3k9IjExMCIgcj0iMTAiIGZpbGw9IiM3QzNBRUQiLz4KPC9zdmc+";
const MAX_RETRIES = 3;
const RETRY_DELAY = 100;

const SkeletonBubble: React.FC<SkeletonBubbleProps> = ({
  width = 70,
  lines = 2,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(animation).start();
  }, []);

  return (
    <View style={[styles.messageBubbleContainer]}>
      <View style={styles.avatarContainer}>
        <View style={[styles.messageAvatar, styles.aiAvatar]}>
          <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
        </View>
        <View style={styles.aiIndicator} />
      </View>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        {[...Array(lines)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              {
                width: `${width - (i === lines - 1 ? 20 : 0)}%`,
                opacity: fadeAnim,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState<ChatSession | null>(null);
  const [model, setModel] = useState<GenerativeModel | null>(null);
  const [profileImage, setProfileImage] = useState<string | "">("");

  useEffect(() => {
    setupChat();
    getUserProfile();
    return () => {
      setChatInstance(null);
    };
  }, []);

  const getUserProfile = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      // Fetch the user's profile image URL from the "users" table
      const { data, error: profileError } = await supabase
        .from("users")
        .select("profile")
        .eq("email", user?.email)
        .single();

      if (profileError) throw profileError;

      // Set the profile image URL
      setProfileImage(data.profile);
    } catch (error: any) {
      console.error("Error fetching user profile:", error?.message);
    }
  };

  const setupChat = async () => {
    try {
      await Promise.all([initializeGeminiChat()]);
    } catch (error) {
      console.error("Error setting up chat:", error);
      Alert.alert(
        "Setup Error",
        "Failed to initialize chat. Please check your internet connection and try again."
      );
    }
  };

  const initializeGeminiChat = async () => {
    try {
      if (!API_KEY) {
        throw new Error("API key is not configured");
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const newModel = genAI.getGenerativeModel({ model: MODEL_NAME });
      setModel(newModel);

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const chat = newModel.startChat({
        generationConfig,
      });

      setChatInstance(chat);
    } catch (error) {
      console.error("Error initializing Gemini chat:", error);
      throw error;
    }
  };

  const retryWithDelay = async (
    fn: () => Promise<any>,
    retries = MAX_RETRIES
  ): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return retryWithDelay(fn, retries - 1);
      }
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: "user",
      timestamp: new Date(),
      avatar: DEFAULT_AVATAR,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      if (!chatInstance || !model) {
        await initializeGeminiChat();
      }

      const result = await retryWithDelay(async () => {
        if (!chatInstance) throw new Error("Chat instance not initialized");
        return chatInstance.sendMessage(message);
      });

      const response = await result.response.text();

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: response,
        sender: "ai",
        timestamp: new Date(),
        avatar: AI_AVATAR,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);

      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error processing your message. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        avatar: AI_AVATAR,
        error: true,
      };

      setMessages((prev) => [...prev, errorResponse]);
      Alert.alert(
        "Error",
        "Failed to send message. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatAIResponse = (text: string): string => {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/```(\w+)?\n([\s\S]*?)```/g, "$2")
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/^\s*\d+\.\s+/gm, "• ")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return formattedText;
  };

  const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const formattedText = formatAIResponse(message.text);

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          message.sender === "user" ? styles.userMessageContainer : null,
        ]}
      >
        <View style={styles.avatarContainer}>
          {message.sender === "user" ? (
            <Image
              source={{ uri: profileImage || DEFAULT_AVATAR }}
              style={[
                styles.messageAvatar,
                message.error && styles.errorAvatar,
              ]}
            />
          ) : (
            <View style={[styles.messageAvatar, styles.aiAvatar]}>
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
            </View>
          )}
          {message.sender === "ai" && <View style={styles.aiIndicator} />}
        </View>
        <View
          style={[
            styles.messageBubble,
            message.sender === "user" ? styles.userBubble : styles.aiBubble,
            message.error && styles.errorBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.sender === "user"
                ? styles.userMessageText
                : styles.aiMessageText,
              message.error && styles.errorText,
            ]}
          >
            {formattedText}
          </Text>
          <Text
            style={[
              styles.timestampText,
              message.sender === "user"
                ? styles.userTimestamp
                : styles.aiTimestamp,
            ]}
          >
            {format(new Date(message.timestamp), "h:mm a")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>AIChat</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>
                  {isLoading ? "Typing..." : "Online"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/Profile")}
          >
            <Image
              source={{ uri: profileImage || DEFAULT_AVATAR }}
              style={styles.headerAvatar}
            />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.keyboardAvoid,
          { paddingTop: Platform.OS === "ios" ? 20 : 0 },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <SkeletonBubble width={85} lines={3} />}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="send your message"
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={1000}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.buttonPressed,
                (!message.trim() || isLoading) && styles.buttonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() && !isLoading ? "#fff" : "#94A3B8"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#1A1A2E",
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitleContainer: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerAvatar: {
    width: 43,
    height: 43,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  userMessageContainer: {
    flexDirection: "row-reverse",
  },
  avatarContainer: {
    position: "relative",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatar: {
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  aiIconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  aiIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#1A1A2E",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  aiMessageText: {
    color: "#fff",
  },
  errorText: {
    color: "#EF4444",
  },
  timestampText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  aiTimestamp: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(26, 26, 46, 0.98)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    position: "relative",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    color: "#fff",
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sendButton: {
    position: "absolute",
    right: 4,
    bottom: 7,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#6D28D9",
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    backgroundColor: "rgba(124, 58, 237, 0.5)",
  },
  errorAvatar: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  // skeletonLine: {
  //     height: 12,
  //     backgroundColor: 'rgba(255, 255, 255, 0.1)',
  //     borderRadius: 6,
  //     marginVertical: 4,
  // },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 2,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  typingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginLeft: 4,
  },
  // New styles for enhanced visual effects
  messageShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Animation related styles
  fadeIn: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  fadeOut: {
    opacity: 0,
    transform: [{ scale: 0.95 }],
  },
  slideIn: {
    transform: [{ translateY: 0 }],
  },
  slideOut: {
    transform: [{ translateY: 50 }],
  },
  // Responsive styles for different screen sizes
  containerSmall: {
    paddingHorizontal: 8,
  },
  containerMedium: {
    paddingHorizontal: 16,
  },
  containerLarge: {
    paddingHorizontal: 24,
    maxWidth: 800,
    alignSelf: "center",
  },
});
