import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var appState
    @State private var columnVisibility = NavigationSplitViewVisibility.all

    var body: some View {
        @Bindable var state = appState

        NavigationSplitView(columnVisibility: $columnVisibility) {
            PagesSidebar()
                .navigationSplitViewColumnWidth(min: 160, ideal: 200, max: 280)
        } content: {
            CanvasView()
                .navigationSplitViewColumnWidth(min: 420, ideal: 660)
                .toolbar { canvasToolbar }
        } detail: {
            RightPanelView()
                .navigationSplitViewColumnWidth(min: 280, ideal: 320, max: 420)
        }
        .sheet(isPresented: $state.showSettings) {
            SettingsView()
        }
    }

    @ToolbarContentBuilder
    var canvasToolbar: some ToolbarContent {
        @Bindable var state = appState

        ToolbarItemGroup(placement: .navigation) {
            Picker("Mode", selection: $state.writeMode) {
                Label("Chat", systemImage: "bubble.left").tag(WriteMode.chat)
                Label("Canvas", systemImage: "pencil").tag(WriteMode.canvas)
            }
            .pickerStyle(.segmented)
            .frame(width: 130)
            .help("Chat: AI responds in sidebar  |  Canvas: AI writes into the document")
        }

        ToolbarItem(placement: .principal) {
            Picker("Model", selection: $state.selectedModelId) {
                ForEach(allModels.filter { $0.provider == .openai }) { m in
                    Text(m.name).tag(m.id)
                }
                Divider()
                ForEach(allModels.filter { $0.provider == .anthropic }) { m in
                    Text(m.name).tag(m.id)
                }
            }
            .frame(width: 170)
        }

        ToolbarItemGroup(placement: .primaryAction) {
            if appState.isStreaming {
                Button {
                    appState.cancelStream()
                } label: {
                    Label("Stop", systemImage: "stop.fill")
                        .foregroundStyle(.red)
                }
                .help("Stop generation")
            }

            Button {
                appState.showSettings = true
            } label: {
                Image(systemName: "key.horizontal")
            }
            .help("API Keys & Settings")
        }
    }
}

// MARK: - Right panel switcher

struct RightPanelView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        @Bindable var state = appState

        VStack(spacing: 0) {
            Picker("Panel", selection: $state.rightPanel) {
                Text("Chat").tag(RightPanel.chat)
                HStack(spacing: 4) {
                    Text("Comments")
                    if !appState.currentPageComments.isEmpty {
                        Text("\(appState.currentPageComments.count)")
                            .font(.caption2)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1)
                            .background(.indigo, in: Capsule())
                            .foregroundStyle(.white)
                    }
                }.tag(RightPanel.comments)
            }
            .pickerStyle(.segmented)
            .padding(10)

            Divider()

            if appState.rightPanel == .chat {
                ChatPanel()
            } else {
                CommentsPanel()
            }
        }
    }
}
