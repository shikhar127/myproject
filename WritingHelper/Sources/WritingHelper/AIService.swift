import Foundation

final class AIService {

    // MARK: - Public interface

    func stream(
        messages: [(String, String)],
        model: AIModel,
        apiKey: String,
        system: String
    ) -> AsyncThrowingStream<String, Error> {
        switch model.provider {
        case .openai:     return streamOpenAI(messages: messages, model: model.id, apiKey: apiKey, system: system)
        case .anthropic:  return streamAnthropic(messages: messages, model: model.id, apiKey: apiKey, system: system)
        }
    }

    // MARK: - OpenAI

    private func streamOpenAI(
        messages: [(String, String)],
        model: String,
        apiKey: String,
        system: String
    ) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task {
                do {
                    var req = URLRequest(url: URL(string: "https://api.openai.com/v1/chat/completions")!)
                    req.httpMethod = "POST"
                    req.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
                    req.setValue("application/json", forHTTPHeaderField: "Content-Type")

                    // o1 family does not support system role
                    let isO1 = model.hasPrefix("o1")
                    var msgs: [[String: String]] = isO1
                        ? [["role": "user", "content": "Instructions: \(system)"]]
                        : [["role": "system", "content": system]]
                    msgs += messages.map { ["role": $0.0, "content": $0.1] }

                    let body: [String: Any] = ["model": model, "messages": msgs, "stream": true]
                    req.httpBody = try JSONSerialization.data(withJSONObject: body)

                    let (bytes, response) = try await URLSession.shared.bytes(for: req)
                    if let http = response as? HTTPURLResponse, http.statusCode != 200 {
                        throw APIError.httpError(http.statusCode)
                    }

                    for try await line in bytes.lines {
                        try Task.checkCancellation()
                        guard line.hasPrefix("data: ") else { continue }
                        let json = String(line.dropFirst(6))
                        if json == "[DONE]" { break }
                        if let data = json.data(using: .utf8),
                           let chunk = try? JSONDecoder().decode(OAIChunk.self, from: data),
                           let text = chunk.choices.first?.delta.content {
                            continuation.yield(text)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }

    // MARK: - Anthropic

    private func streamAnthropic(
        messages: [(String, String)],
        model: String,
        apiKey: String,
        system: String
    ) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task {
                do {
                    var req = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
                    req.httpMethod = "POST"
                    req.setValue(apiKey,        forHTTPHeaderField: "x-api-key")
                    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                    req.setValue("2023-06-01",   forHTTPHeaderField: "anthropic-version")

                    let msgs = messages.map { ["role": $0.0, "content": $0.1] }
                    let body: [String: Any] = [
                        "model": model,
                        "max_tokens": 4096,
                        "system": system,
                        "messages": msgs,
                        "stream": true,
                    ]
                    req.httpBody = try JSONSerialization.data(withJSONObject: body)

                    let (bytes, response) = try await URLSession.shared.bytes(for: req)
                    if let http = response as? HTTPURLResponse, http.statusCode != 200 {
                        throw APIError.httpError(http.statusCode)
                    }

                    for try await line in bytes.lines {
                        try Task.checkCancellation()
                        guard line.hasPrefix("data: ") else { continue }
                        let json = String(line.dropFirst(6))
                        if let data = json.data(using: .utf8),
                           let chunk = try? JSONDecoder().decode(ClaudeChunk.self, from: data),
                           chunk.type == "content_block_delta",
                           let text = chunk.delta?.text {
                            continuation.yield(text)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }
}

// MARK: - JSON models

private struct OAIChunk: Decodable {
    struct Choice: Decodable {
        struct Delta: Decodable { let content: String? }
        let delta: Delta
    }
    let choices: [Choice]
}

private struct ClaudeChunk: Decodable {
    struct Delta: Decodable { let type: String; let text: String? }
    let type: String
    let delta: Delta?
}

enum APIError: LocalizedError {
    case httpError(Int)
    var errorDescription: String? {
        if case .httpError(let code) = self { return "API error \(code)" }
        return nil
    }
}
