interface Message {
  sender: "User" | "AI";
  text: string;
}

const chat: Message[] = [
  { sender: "User", text: "Hello" },
  { sender: "AI", text: "Hi, how can I help?" }
];

function printChat(messages: Message[]) {
  for (let msg of messages) {
    console.log(`${msg.sender}: ${msg.text}`);
  }
}

printChat(chat);
