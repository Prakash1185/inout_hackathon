import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { toast } from "sonner-native";

import {
  createUserMessage,
  sendChatMessage,
  type ChatMessage,
} from "@/src/services/chatbot.service";
import { useAppTheme } from "@/src/store/ui-store";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm Velora AI — your fitness, nutrition, and recovery assistant. Ask me anything about your workouts, diet, or recovery plan. 💪",
  timestamp: Date.now(),
};

function MessageBubble({
  message,
  theme,
}: {
  message: ChatMessage;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  const isUser = message.role === "user";

  return (
    <View
      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser ? "self-end" : "self-start"
      }`}
      style={{
        backgroundColor: isUser ? theme.accent : theme.surface,
        borderWidth: 1,
        borderColor: isUser ? theme.accent : theme.border,
      }}
    >
      {!isUser ? (
        <View className="mb-1.5 flex-row items-center gap-2">
          <View
            className="h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.accent }}
          >
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
          </View>
          <Text
            className="text-[11px] font-semibold"
            style={{ color: theme.accent }}
          >
            Velora AI
          </Text>
        </View>
      ) : null}

      <Text
        className="text-sm leading-6"
        style={{ color: isUser ? "#FFFFFF" : theme.text }}
      >
        {message.content}
      </Text>

      <Text
        className="mt-1.5 text-[10px]"
        style={{ color: isUser ? "rgba(255,255,255,0.6)" : theme.textMuted }}
      >
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

export function ChatScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || isLoading) {
      return;
    }

    const userMsg = createUserMessage(text);
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    scrollToEnd();

    try {
      const assistantMsg = await sendChatMessage(
        messages.filter((m) => m.id !== "welcome"),
        text,
      );
      setMessages((prev) => [...prev, assistantMsg]);
      scrollToEnd();
    } catch {
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <View className="px-4 py-1.5">
        <MessageBubble message={item} theme={theme} />
      </View>
    ),
    [theme],
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-3 border-b px-4 pb-3 pt-3"
        style={{
          borderBottomColor: theme.border,
          backgroundColor: theme.background,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </Pressable>

        <View className="flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: theme.text }}
          >
            Velora AI Chat
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            Fitness & recovery assistant
          </Text>
        </View>

        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.accent }}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
        onContentSizeChange={scrollToEnd}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {isLoading ? (
        <View className="flex-row items-center gap-2 px-6 pb-2">
          <ActivityIndicator size="small" color={theme.accent} />
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            Velora AI is thinking...
          </Text>
        </View>
      ) : null}

      {/* Suggestions (shown only when no messages beyond welcome) */}
      {messages.length <= 1 && !isLoading ? (
        <View className="flex-row flex-wrap gap-2 px-4 pb-3">
          {[
            "How to improve my squat form?",
            "Post-workout meal ideas",
            "Tips for knee recovery",
            "Best stretches before running",
          ].map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => {
                setInputText(suggestion);
              }}
              className="rounded-full border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: theme.text }}
              >
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Input */}
      <View
        className="flex-row items-end gap-2 border-t px-4 pb-4 pt-3"
        style={{
          borderTopColor: theme.border,
          backgroundColor: theme.background,
        }}
      >
        <View
          className="flex-1 flex-row items-end rounded-2xl border px-4 py-2"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
            minHeight: 44,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Velora AI..."
            placeholderTextColor={theme.textMuted}
            multiline
            className="flex-1 text-sm"
            style={{
              color: theme.text,
              maxHeight: 100,
              paddingTop: Platform.OS === "ios" ? 4 : 0,
            }}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!isLoading}
          />
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              inputText.trim() && !isLoading
                ? theme.accent
                : theme.surfaceMuted,
          }}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() && !isLoading ? "#FFFFFF" : theme.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
