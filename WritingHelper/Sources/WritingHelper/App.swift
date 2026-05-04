import SwiftUI

@main
struct WritingHelperApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
                .frame(minWidth: 900, minHeight: 600)
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified(showsTitle: false))
        .commands {
            // NSTextView handles Undo/Redo natively — remove SwiftUI's duplicate
            CommandGroup(replacing: .undoRedo) {}
        }
    }
}
