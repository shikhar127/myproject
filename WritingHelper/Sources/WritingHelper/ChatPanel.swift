import SwiftUI

struct ChatPanel: View {
    @Environment(AppState.self) private var appState
    @State private var input = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        if appState.chatMessages.isEmpty {
                            emptyState
                        }
                        ForEach(appState.chatMessages) { msg in
                            BubbleView(msg: msg)
                                .id(msg.id)
                        }
                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(12)
                }
                .onChange(of: appState.chatMessages.count) {
                    withAnimation { proxy.scrollTo("bottom") }
                }
                .onChange(of: appState.chatMessages.last?.content) {
                    proxy.scrollTo("bottom")
                }
            }

            Divider()

            // Input
            inputBar
        }
    }

    // MARK: - Empty state

    var emptyState: some View {
        VStack(spacing: 6) {
            Image(systemName: appState.writeMode == .canvas ? "pencil.and.scribble" : "bubble.left.and.bubble.right")
                .font(.system(size: 28))
                .foregroundStyle(.secondary)
            Text(appState.writeMode == .canvas ? "Canvas mode" : "Chat mode")
                .font(.headline)
                .foregroundStyle(.secondary)
            Text(appState.writeMode == .canvas
                ? "Describe what to write and AI will type directly into the document."
                : "Ask questions or get writing help. Use → to apply any reply to the canvas.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    // MARK: - Input bar

    var inputBar: some View {
        HStack(alignment: .bottom, spacing: 8) {
            TextField(
                appState.writeMode == .canvas ? "What should I write?" : "Ask anything…",
                text: $input,
                axis: .vertical
            )
            .lineLimit(1...5)
            .textFieldStyle(.plain)
            .padding(8)
            .background(.background.secondary, in: RoundedRectangle(cornerRadius: 10))
            .focused($focused)
            .onSubmit { send() }
            .submitLabel(.send)
            .disabled(appState.isStreaming)

            Button(action: send) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 28))
                    .foregroundStyle(canSend ? .indigo : .secondary)
            }
            .buttonStyle(.plain)
            .disabled(!canSend)
        }
        .padding(10)
    }

    var canSend: Bool { !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !appState.isStreaming }

    func send() {
        let text = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        input = ""
        focused = true
        if appState.writeMode == .canvas {
            appState.writeToCanvas(text)
        } else {
            appState.sendChat(text)
        }
    }
}

// MARK: - Message bubble

struct BubbleView: View {
    @Environment(AppState.self) private var appState
    let msg: ChatMessage
    @State private var hovered = false

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            if msg.role == .user { Spacer(minLength: 40) }

            VStack(alignment: msg.role == .user ? .trailing : .leading, spacing: 4) {
                Text(msg.content.isEmpty ? "…" : msg.content)
                    .textSelection(.enabled)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        msg.role == .user
                            ? Color.indigo
                            : Color(NSColor.controlBackgroundColor),
                        in: RoundedRectangle(cornerRadius: 14)
                    )
                    .foregroundStyle(msg.role == .user ? .white : .primary)

                // "→ Canvas" button for assistant messages
                if msg.role == .assistant && !msg.content.isEmpty && hovered {
                    Button {
                        applyToCanvas()
                    } label: {
                        Label("Apply to Canvas", systemImage: "arrow.right.circle")
                            .font(.caption)
                    }
                    .buttonStyle(.borderless)
                    .foregroundStyle(.indigo)
                }
            }

            if msg.role == .assistant { Spacer(minLength: 40) }
        }
        .onHover { hovered = $0 }
    }

    func applyToCanvas() {
        guard let inserter = appState.canvasInsert else { return }
        let getter = appState.canvasGetText?() ?? ""
        if !getter.isEmpty { inserter("\n\n") }
        inserter(msg.content)
    }
}
