import SwiftUI

struct CommentsPanel: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        if appState.currentPageComments.isEmpty {
            emptyState
        } else {
            ScrollViewReader { proxy in
                List(selection: Binding(
                    get: { appState.selectedCommentId },
                    set: { id in
                        appState.selectedCommentId = id
                        if let id, let c = appState.comments.first(where: { $0.id == id }) {
                            appState.canvasScrollTo?(c.range)
                        }
                    }
                )) {
                    ForEach(appState.currentPageComments.sorted(by: { $0.rangeLocation < $1.rangeLocation })) { comment in
                        CommentRow(comment: comment)
                            .tag(comment.id)
                            .id(comment.id)
                    }
                }
                .listStyle(.inset)
                .onChange(of: appState.selectedCommentId) { _, id in
                    if let id { withAnimation { proxy.scrollTo(id) } }
                }
            }
        }
    }

    var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "text.bubble")
                .font(.system(size: 28))
                .foregroundStyle(.secondary)
            Text("No comments yet")
                .font(.headline)
                .foregroundStyle(.secondary)
            Text("Select text in the document,\nthen right-click → Add Comment.")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Comment row

struct CommentRow: View {
    @Environment(AppState.self) private var appState
    let comment: Comment
    @State private var input = ""
    @State private var expanded = false
    @FocusState private var focused: Bool

    var isSelected: Bool { appState.selectedCommentId == comment.id }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header: snippet of highlighted text
            HStack(alignment: .top) {
                Image(systemName: "quote.closing")
                    .font(.caption)
                    .foregroundStyle(.orange)
                    .padding(.top, 1)
                Text(comment.selectedText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Button {
                    withAnimation { expanded.toggle() }
                } label: {
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                .buttonStyle(.plain)
            }

            // Thread
            if expanded || isSelected {
                if comment.thread.isEmpty {
                    Text("Ask a question about this passage…")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                        .italic()
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(comment.thread) { msg in
                            ThreadBubble(msg: msg)
                        }
                    }
                }

                // Reply input
                HStack(alignment: .bottom, spacing: 6) {
                    TextField("Ask about this…", text: $input, axis: .vertical)
                        .lineLimit(1...4)
                        .textFieldStyle(.plain)
                        .font(.callout)
                        .padding(7)
                        .background(Color(NSColor.controlBackgroundColor), in: RoundedRectangle(cornerRadius: 8))
                        .focused($focused)
                        .disabled(appState.isStreaming)
                        .onSubmit { sendReply() }

                    Button(action: sendReply) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 22))
                            .foregroundStyle(canSend ? .indigo : .secondary)
                    }
                    .buttonStyle(.plain)
                    .disabled(!canSend)
                }
            }
        }
        .padding(.vertical, 6)
        .contentShape(Rectangle())
        .onTapGesture {
            appState.selectedCommentId = comment.id
            appState.canvasScrollTo?(comment.range)
            withAnimation { expanded = true }
        }
    }

    var canSend: Bool {
        !input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !appState.isStreaming
    }

    func sendReply() {
        let text = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        input = ""
        appState.sendCommentReply(text, to: comment.id)
    }
}

// MARK: - Thread bubble

struct ThreadBubble: View {
    @Environment(AppState.self) private var appState
    let msg: CommentMessage

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(msg.role == .user ? "You" : "AI")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .fontWeight(.semibold)

            Text(msg.content.isEmpty ? "…" : msg.content)
                .font(.callout)
                .textSelection(.enabled)
                .foregroundStyle(.primary)

            // Citation page link
            if let pageId = msg.linkedPageId,
               let page = appState.pages.first(where: { $0.id == pageId }) {
                Button {
                    appState.selectPage(page)
                } label: {
                    Label(
                        page.citationNumber.map { "See Note \($0)" } ?? page.title,
                        systemImage: "doc.text"
                    )
                    .font(.caption)
                }
                .buttonStyle(.borderless)
                .foregroundStyle(.indigo)
            }
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            msg.role == .user
                ? Color.indigo.opacity(0.08)
                : Color(NSColor.controlBackgroundColor),
            in: RoundedRectangle(cornerRadius: 8)
        )
    }
}
