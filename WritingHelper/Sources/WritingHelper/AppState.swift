import Foundation
import AppKit
import Observation

@Observable
@MainActor
final class AppState {

    // MARK: - Pages
    var pages: [DocumentPage] = []
    var currentPageId: UUID

    var currentPage: DocumentPage? { pages.first { $0.id == currentPageId } }

    // MARK: - Chat
    var chatMessages: [ChatMessage] = []
    var writeMode: WriteMode = .chat

    // MARK: - Comments
    var comments: [Comment] = []
    var selectedCommentId: UUID?
    var currentPageComments: [Comment] { comments.filter { $0.pageId == currentPageId } }

    // MARK: - UI state
    var rightPanel: RightPanel = .chat
    var isStreaming = false
    var showSettings = false

    // MARK: - Settings (UserDefaults-backed)
    var openaiKey: String {
        get { UserDefaults.standard.string(forKey: "wh_openaiKey") ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: "wh_openaiKey") }
    }
    var anthropicKey: String {
        get { UserDefaults.standard.string(forKey: "wh_anthropicKey") ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: "wh_anthropicKey") }
    }
    var selectedModelId: String {
        get { UserDefaults.standard.string(forKey: "wh_modelId") ?? "gpt-4o" }
        set { UserDefaults.standard.set(newValue, forKey: "wh_modelId") }
    }

    var selectedModel: AIModel { allModels.first { $0.id == selectedModelId } ?? allModels[0] }
    var currentApiKey: String { selectedModel.provider == .openai ? openaiKey : anthropicKey }

    // MARK: - Canvas bridge (set by CanvasView coordinator)
    var canvasInsert: ((String) -> Void)?
    var canvasGetText: (() -> String)?
    var canvasSwitchPage: ((DocumentPage) -> Void)?
    var canvasScrollTo: ((NSRange) -> Void)?
    var canvasInsertCitation: ((Int, UUID, Int) -> Void)?

    // MARK: - AI
    let ai = AIService()
    private var streamTask: Task<Void, Never>?
    private var nextCitationNumber = 1

    init() {
        let first = DocumentPage(title: "Untitled Document")
        pages = [first]
        currentPageId = first.id
    }

    // MARK: - Page management

    func selectPage(_ page: DocumentPage) {
        guard page.id != currentPageId else { return }
        currentPageId = page.id
        canvasSwitchPage?(page)
    }

    @discardableResult
    func addPage(title: String, isCitationPage: Bool = false) -> DocumentPage {
        let page = DocumentPage(title: title, isCitationPage: isCitationPage)
        pages.append(page)
        return page
    }

    func deletePage(_ page: DocumentPage) {
        guard pages.count > 1 else { return }
        pages.removeAll { $0.id == page.id }
        comments.removeAll { $0.pageId == page.id }
        if currentPageId == page.id {
            currentPageId = pages[0].id
            canvasSwitchPage?(pages[0])
        }
    }

    // MARK: - Cancel streaming

    func cancelStream() {
        streamTask?.cancel()
        streamTask = nil
        isStreaming = false
    }

    // MARK: - Chat send

    func sendChat(_ text: String) {
        guard !currentApiKey.isEmpty else { showSettings = true; return }

        let userMsg = ChatMessage(role: .user, content: text)
        chatMessages.append(userMsg)

        var assistantMsg = ChatMessage(role: .assistant)
        chatMessages.append(assistantMsg)
        let aid = assistantMsg.id

        let canvasText = canvasGetText?() ?? ""
        let system = """
        You are a collaborative writing assistant. Help the user with their document.

        Current document:
        ---
        \(canvasText.prefix(3000))
        ---
        """
        let history = chatMessages.dropLast().map {
            ($0.role == .user ? "user" : "assistant", $0.content)
        }

        isStreaming = true
        streamTask = Task {
            do {
                let stream = ai.stream(messages: Array(history), model: selectedModel,
                                       apiKey: currentApiKey, system: system)
                for try await token in stream {
                    if Task.isCancelled { break }
                    if let i = chatMessages.firstIndex(where: { $0.id == aid }) {
                        chatMessages[i].content += token
                    }
                }
            } catch {
                if let i = chatMessages.firstIndex(where: { $0.id == aid }) {
                    chatMessages[i].content = "Error: \(error.localizedDescription)"
                }
            }
            isStreaming = false
        }
    }

    // MARK: - Canvas write

    func writeToCanvas(_ prompt: String) {
        guard !currentApiKey.isEmpty else { showSettings = true; return }

        let canvasText = canvasGetText?() ?? ""
        let system = """
        You are writing content for a document. Write exactly what the user requests —
        no preamble, no meta-commentary, just the content itself.
        Continue in the same style if the document already has content.

        Current document:
        ---
        \(canvasText.prefix(3000))
        ---
        """

        isStreaming = true
        streamTask = Task {
            do {
                let stream = ai.stream(messages: [("user", prompt)], model: selectedModel,
                                       apiKey: currentApiKey, system: system)
                for try await token in stream {
                    if Task.isCancelled { break }
                    canvasInsert?(token)
                }
            } catch {}
            isStreaming = false
        }
    }

    // MARK: - Comments

    @discardableResult
    func addComment(selectedText: String, range: NSRange) -> Comment {
        let c = Comment(pageId: currentPageId, selectedText: selectedText, range: range)
        comments.append(c)
        selectedCommentId = c.id
        rightPanel = .comments
        return c
    }

    func sendCommentReply(_ text: String, to commentId: UUID) {
        guard !currentApiKey.isEmpty,
              let ci = comments.firstIndex(where: { $0.id == commentId }) else {
            if currentApiKey.isEmpty { showSettings = true }
            return
        }

        let userMsg = CommentMessage(role: .user, content: text)
        comments[ci].thread.append(userMsg)

        var assistantMsg = CommentMessage(role: .assistant)
        comments[ci].thread.append(assistantMsg)
        let mid = assistantMsg.id

        let comment = comments[ci]
        let canvasText = canvasGetText?() ?? ""
        let system = """
        You are a writing assistant answering a question about a highlighted passage.

        Highlighted text: "\(comment.selectedText)"

        Document context:
        ---
        \(canvasText.prefix(3000))
        ---

        Answer the question about the highlighted passage. Be clear and helpful.
        If your answer requires more than 400 words to do justice, add exactly "[EXPAND]"
        on its own line at the very end.
        """

        let history = comment.thread.dropLast().map {
            ($0.role == .user ? "user" : "assistant", $0.content)
        }

        isStreaming = true
        streamTask = Task {
            var full = ""
            do {
                let stream = ai.stream(messages: Array(history), model: selectedModel,
                                       apiKey: currentApiKey, system: system)
                for try await token in stream {
                    if Task.isCancelled { break }
                    full += token
                    if let i = comments.firstIndex(where: { $0.id == commentId }),
                       let j = comments[i].thread.firstIndex(where: { $0.id == mid }) {
                        comments[i].thread[j].content = full
                    }
                }
            } catch {
                full = "Error: \(error.localizedDescription)"
            }

            // Decide whether to expand into a citation page
            let needsPage = full.contains("[EXPAND]") || full.count > 1400

            if needsPage, let i = comments.firstIndex(where: { $0.id == commentId }) {
                let clean = full
                    .replacingOccurrences(of: "\n[EXPAND]", with: "")
                    .replacingOccurrences(of: "[EXPAND]", with: "")
                    .trimmingCharacters(in: .whitespacesAndNewlines)

                let num = nextCitationNumber
                nextCitationNumber += 1

                let snippet = String(comment.selectedText.prefix(40))
                let pageTitle = "Note \(num) — \(snippet)…"
                let citPage = addPage(title: pageTitle, isCitationPage: true)
                citPage.citationNumber = num
                citPage.sourceCommentId = commentId

                // Write full content into citation page RTF
                let header = NSAttributedString(
                    string: "Re: \"\(comment.selectedText)\"\n\n",
                    attributes: [
                        .font: NSFont.systemFont(ofSize: 13, weight: .semibold),
                        .foregroundColor: NSColor.secondaryLabelColor,
                    ]
                )
                let body = NSAttributedString(
                    string: clean,
                    attributes: [
                        .font: NSFont.systemFont(ofSize: 14),
                        .foregroundColor: NSColor.textColor,
                    ]
                )
                let combined = NSMutableAttributedString(attributedString: header)
                combined.append(body)
                citPage.rtfData = combined.rtf(
                    from: NSRange(location: 0, length: combined.length),
                    documentAttributes: [:]
                )

                // Truncate the inline comment reply to a summary
                let summary = String(clean.prefix(240)).trimmingCharacters(in: .whitespacesAndNewlines) + "…"
                if let i2 = comments.firstIndex(where: { $0.id == commentId }),
                   let j = comments[i2].thread.firstIndex(where: { $0.id == mid }) {
                    comments[i2].thread[j].content = summary
                    comments[i2].thread[j].linkedPageId = citPage.id
                }

                // Insert citation marker [n] into document after the highlighted range
                let insertLoc = comment.rangeLocation + comment.rangeLength
                canvasInsertCitation?(num, citPage.id, insertLoc)
            }

            isStreaming = false
        }
    }
}
