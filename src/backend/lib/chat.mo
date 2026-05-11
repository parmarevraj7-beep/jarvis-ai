import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/chat";

module {
  /// Append a message to history.
  public func appendMessage(
    history : List.List<Types.ChatMessage>,
    role : Text,
    content : Text,
  ) : () {
    history.add({ role; content; timestamp = Time.now() });
  };

  /// Return history as an immutable array.
  public func getHistory(history : List.List<Types.ChatMessage>) : [Types.ChatMessage] {
    history.toArray();
  };

  /// Clear all messages from history.
  public func clearHistory(history : List.List<Types.ChatMessage>) : () {
    history.clear();
  };

  /// Convert history list to (role, content) pairs for OpenAI API.
  public func toMessagePairs(history : List.List<Types.ChatMessage>) : [(Text, Text)] {
    history.toArray().map<Types.ChatMessage, (Text, Text)>(func(m) { (m.role, m.content) });
  };

  /// Return the user message text at `messageIndex`, trapping if out of bounds or not a user message.
  public func getUserMessageAt(
    history : List.List<Types.ChatMessage>,
    messageIndex : Nat,
  ) : Text {
    if (messageIndex >= history.size()) Runtime.trap("retryMessage: index out of bounds");
    let msg = history.at(messageIndex);
    if (msg.role != "user") Runtime.trap("retryMessage: message at index is not a user message");
    msg.content;
  };

  /// Replace the assistant message at `index` with new content.
  public func replaceAssistantAt(
    history : List.List<Types.ChatMessage>,
    index : Nat,
    content : Text,
  ) : () {
    history.put(index, { role = "assistant"; content; timestamp = Time.now() });
  };

  /// Truncate history so it has exactly `newSize` messages.
  public func truncateTo(
    history : List.List<Types.ChatMessage>,
    newSize : Nat,
  ) : () {
    if (newSize < history.size()) {
      history.truncate(newSize);
    };
  };
};
