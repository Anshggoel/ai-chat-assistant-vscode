var chat = [
    { sender: "User", text: "Hello" },
    { sender: "AI", text: "Hi, how can I help?" }
];
function printChat(messages) {
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        console.log("".concat(msg.sender, ": ").concat(msg.text));
    }
}
printChat(chat);
