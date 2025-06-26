"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function activate(context) {
    // Command to open the chat panel
    context.subscriptions.push(vscode.commands.registerCommand('ai-chat-assistant.openChat', () => {
        const panel = vscode.window.createWebviewPanel('chatAssistant', 'AI Chat Assistant 💬', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media'))
            ]
        });
        const htmlPath = path.join(context.extensionPath, 'media', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');
        // Fix asset paths so they work inside WebView
        html = html.replace(/"\/assets\//g, `"${panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'assets')))}/`);
        panel.webview.html = html;
        // Optional: Enable message passing from webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'readFile') {
                const filename = message.filename;
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    panel.webview.postMessage({ command: 'fileResult', content: 'No workspace open.' });
                    return;
                }
                const fileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, filename);
                try {
                    const bytes = await vscode.workspace.fs.readFile(fileUri);
                    const content = new TextDecoder('utf-8').decode(bytes);
                    panel.webview.postMessage({ command: 'fileResult', content });
                }
                catch (err) {
                    panel.webview.postMessage({ command: 'fileResult', content: '⚠️ Failed to read file: ' + filename });
                }
            }
        });
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map