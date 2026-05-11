import { defaultConfig; type Config } "mo:openai-client/Config";
import ChatApi "mo:openai-client/Apis/ChatApi";
import CreateChatCompletionRequest "mo:openai-client/Models/CreateChatCompletionRequest";
import ChatCompletionRequestUserMessage "mo:openai-client/Models/ChatCompletionRequestUserMessage";
import ChatCompletionRequestSystemMessage "mo:openai-client/Models/ChatCompletionRequestSystemMessage";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import ChatCompletionRequestAssistantMessage "mo:openai-client/Models/ChatCompletionRequestAssistantMessage";
import ChatCompletionRequestMessage "mo:openai-client/Models/ChatCompletionRequestMessage";

module {
  /// Build a Config bound to a single bearer.
  /// `is_replicated = ?false` is REQUIRED — see extension-openai skill §3.
  public func configForKey(key : Text) : Config {
    {
      defaultConfig with
      auth = ?#bearer key;
      is_replicated = ?false;
    };
  };

  /// Run a chat completion with conversation history.
  /// `history` is an array of (role, content) pairs already including the new user message.
  public func runChat(config : Config, history : [(Text, Text)], systemPrompt : Text) : async* Text {
    let systemMessage = ChatCompletionRequestSystemMessage.JSON.init({
      content = #string(systemPrompt);
      role = #system_;
    });
    let userMessages = history.map<(Text, Text), ChatCompletionRequestMessage.ChatCompletionRequestMessage>(
      func((role, content)) {
        if (role == "assistant") {
          let baseMsg = ChatCompletionRequestAssistantMessage.JSON.init({
            role = #assistant;
          });
          #assistant({ baseMsg with content = ?#string(content) });
        } else {
          let msg = ChatCompletionRequestUserMessage.JSON.init({
            content = #string(content);
            role = #user;
          });
          #user(msg);
        };
      },
    );
    let allMessages = [#system_(systemMessage)].concat(userMessages);
    let req = CreateChatCompletionRequest.JSON.init({
      messages = allMessages;
      model = "gpt-4o-mini";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("OpenAI returned no choices");
    };
    switch (resp.choices[0].message.content) {
      case (?text) text;
      case null Runtime.trap("OpenAI returned no text content");
    };
  };
};
