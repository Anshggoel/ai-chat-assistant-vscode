import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  // Command to open the chat panel
  context.subscriptions.push(
    vscode.commands.registerCommand('ai-chat-assistant.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'chatAssistant',
        'AI Chat Assistant 💬',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'media'))
          ]
        }
      );

      const htmlPath = path.join(context.extensionPath, 'media', 'index.html');
      let html = fs.readFileSync(htmlPath, 'utf-8');

      // Fix asset paths so they work inside WebView
      html = html.replace(/"\/assets\//g, `"${panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'assets'))
      )}/`);

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
          } catch (err) {
            panel.webview.postMessage({ command: 'fileResult', content: '⚠️ Failed to read file: ' + filename });
          }
        }
      });
    })
  );
}

export function deactivate() {}
