import SwiftUI

struct SettingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var openaiKey = ""
    @State private var anthropicKey = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Image(systemName: "key.horizontal.fill")
                    .foregroundStyle(.indigo)
                Text("API Keys")
                    .font(.title3.bold())
                Spacer()
                Button("Done") { save(); dismiss() }
                    .keyboardShortcut(.return)
                    .buttonStyle(.borderedProminent)
            }
            .padding()

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    keyField(
                        label: "OpenAI API Key",
                        subtitle: "For GPT-4o, GPT-4 Turbo, o1 models",
                        placeholder: "sk-…",
                        value: $openaiKey
                    )

                    keyField(
                        label: "Anthropic API Key",
                        subtitle: "For Claude Opus 4, Sonnet 4.6, Haiku 4",
                        placeholder: "sk-ant-…",
                        value: $anthropicKey
                    )

                    VStack(alignment: .leading, spacing: 4) {
                        Label("Privacy", systemImage: "lock.shield")
                            .font(.footnote.bold())
                            .foregroundStyle(.secondary)
                        Text("Keys are stored in macOS UserDefaults on your device and sent directly to the respective AI provider. They are never stored or transmitted elsewhere.")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .padding(10)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                }
                .padding()
            }
        }
        .frame(width: 420)
        .onAppear {
            openaiKey = appState.openaiKey
            anthropicKey = appState.anthropicKey
        }
    }

    @ViewBuilder
    func keyField(label: String, subtitle: String, placeholder: String, value: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.callout.bold())
                Text(subtitle).font(.caption).foregroundStyle(.secondary)
            }
            SecureField(placeholder, text: value)
                .textFieldStyle(.roundedBorder)
                .font(.system(.callout, design: .monospaced))
        }
    }

    func save() {
        appState.openaiKey = openaiKey
        appState.anthropicKey = anthropicKey
    }
}
