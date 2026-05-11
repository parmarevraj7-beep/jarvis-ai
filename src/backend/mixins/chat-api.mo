import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Types "../types/chat";
import ChatLib "../lib/chat";
import OpenAI "../lib/openai";

mixin (
  history : List.List<Types.ChatMessage>,
  openAIApiKey : { var value : ?Text },
  personality : { var value : Text },
) {
  /// Map a personality name to its system prompt.
  private func systemPromptForPersonality(p : Text) : Text {
    if (p == "friday") {
      "You are Friday, a casual and friendly Irish AI assistant. Be warm, approachable, and conversational while remaining helpful and intelligent.";
    } else if (p == "analytical") {
      "You are an analytical AI assistant. Be precise, data-driven, and methodical. Present information in a structured and logical manner, citing reasoning clearly.";
    } else {
      // Default: jarvis
      "You are Jarvis, an advanced AI assistant inspired by Iron Man. Speak in a professional British manner. Be concise, intelligent, and impeccably helpful.";
    };
  };

  /// Send a user message and get an AI response.
  public shared func sendMessage(message : Text) : async Text {
    let ?key = openAIApiKey.value else Runtime.trap("OpenAI API key not configured. Call setOpenAIKey first.");
    ChatLib.appendMessage(history, "user", message);
    let pairs = ChatLib.toMessagePairs(history);
    let config = OpenAI.configForKey(key);
    let response = await* OpenAI.runChat(config, pairs, systemPromptForPersonality(personality.value));
    ChatLib.appendMessage(history, "assistant", response);
    response;
  };

  /// Retry: re-send the user message at messageIndex and replace the assistant reply at messageIndex+1.
  public shared func retryMessage(messageIndex : Nat) : async Text {
    let ?key = openAIApiKey.value else Runtime.trap("OpenAI API key not configured. Call setOpenAIKey first.");
    ignore ChatLib.getUserMessageAt(history, messageIndex); // validates index and role
    // Truncate everything after the user message so we rebuild from messageIndex+1
    ChatLib.truncateTo(history, messageIndex + 1);
    let pairs = ChatLib.toMessagePairs(history);
    let config = OpenAI.configForKey(key);
    let response = await* OpenAI.runChat(config, pairs, systemPromptForPersonality(personality.value));
    ChatLib.appendMessage(history, "assistant", response);
    response;
  };

  /// Retrieve the current session's message history.
  public query func getHistory() : async [Types.ChatMessage] {
    ChatLib.getHistory(history);
  };

  /// Reset the conversation.
  public shared func clearHistory() : async () {
    ChatLib.clearHistory(history);
  };

  /// Admin: set the OpenAI API key.
  public shared ({ caller }) func setOpenAIKey(key : Text) : async () {
    openAIApiKey.value := ?key;
  };

  /// Set the active AI personality: 'jarvis', 'friday', or 'analytical'.
  public shared func setPersonality(p : Text) : async () {
    if (p != "jarvis" and p != "friday" and p != "analytical") {
      Runtime.trap("Invalid personality. Must be one of: jarvis, friday, analytical");
    };
    personality.value := p;
  };

  /// Get the active AI personality.
  public query func getPersonality() : async Text {
    personality.value;
  };
};
