import Foundation
import AppKit

// MARK: - AI models

enum AIProvider: String, Codable { case openai, anthropic }

struct AIModel: Identifiable, Hashable {
    let id: String
    let name: String
    let provider: AIProvider
}

let allModels: [AIModel] = [
    AIModel(id: "gpt-4o",                      name: "GPT-4o",            provider: .openai),
    AIModel(id: "gpt-4o-mini",                 name: "GPT-4o mini",       provider: .openai),
    AIModel(id: "gpt-4-turbo",                 name: "GPT-4 Turbo",       provider: .openai),
    AIModel(id: "o1",                          name: "o1",                provider: .openai),
    AIModel(id: "o1-mini",                     name: "o1-mini",           provider: .openai),
    AIModel(id: "claude-opus-4-7",             name: "Claude Opus 4",     provider: .anthropic),
    AIModel(id: "claude-sonnet-4-6",           name: "Claude Sonnet 4.6", provider: .anthropic),
    AIModel(id: "claude-haiku-4-5-20251001",   name: "Claude Haiku 4",    provider: .anthropic),
]

// MARK: - Document page

@Observable
final class DocumentPage: Identifiable {
    let id: UUID
    var title: String
    var rtfData: Data?
    let createdAt: Date
    var isCitationPage: Bool
    var citationNumber: Int?
    var sourceCommentId: UUID?

    init(title: String, isCitationPage: Bool = false) {
        self.id = UUID()
        self.title = title
        self.rtfData = nil
        self.createdAt = Date()
        self.isCitationPage = isCitationPage
    }
}

// MARK: - Comment & thread

@Observable
final class Comment: Identifiable {
    let id: UUID
    let pageId: UUID
    var selectedText: String
    var rangeLocation: Int
    var rangeLength: Int
    var thread: [CommentMessage]
    let createdAt: Date

    var range: NSRange { NSRange(location: rangeLocation, length: rangeLength) }

    init(pageId: UUID, selectedText: String, range: NSRange) {
        self.id = UUID()
        self.pageId = pageId
        self.selectedText = selectedText
        self.rangeLocation = range.location
        self.rangeLength = range.length
        self.thread = []
        self.createdAt = Date()
    }
}

struct CommentMessage: Identifiable {
    let id: UUID
    let role: MsgRole
    var content: String
    let timestamp: Date
    var linkedPageId: UUID?   // set when a citation page was created for this reply

    init(role: MsgRole, content: String = "") {
        self.id = UUID()
        self.role = role
        self.content = content
        self.timestamp = Date()
    }
}

// MARK: - Chat message

struct ChatMessage: Identifiable {
    let id: UUID
    let role: MsgRole
    var content: String
    let timestamp: Date

    init(role: MsgRole, content: String = "") {
        self.id = UUID()
        self.role = role
        self.content = content
        self.timestamp = Date()
    }
}

enum MsgRole { case user, assistant }

// MARK: - Write mode

enum WriteMode { case chat, canvas }

// MARK: - Right panel

enum RightPanel { case chat, comments }
