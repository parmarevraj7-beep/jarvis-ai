import List "mo:core/List";
import Types "types/chat";
import MixinChatApi "mixins/chat-api";

actor {
  let history = List.empty<Types.ChatMessage>();
  let openAIApiKey = { var value : ?Text = null };
  let personality = { var value : Text = "jarvis" };
  include MixinChatApi(history, openAIApiKey, personality);
};
