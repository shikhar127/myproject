import SwiftUI

struct PagesSidebar: View {
    @Environment(AppState.self) private var appState
    @State private var editingId: UUID? = nil
    @State private var editTitle = ""

    var body: some View {
        List(selection: Binding(
            get: { appState.currentPageId },
            set: { id in
                if let id, let page = appState.pages.first(where: { $0.id == id }) {
                    appState.selectPage(page)
                }
            }
        )) {
            Section("Documents") {
                ForEach(appState.pages.filter { !$0.isCitationPage }) { page in
                    pageRow(page)
                }
            }

            let citations = appState.pages.filter { $0.isCitationPage }
            if !citations.isEmpty {
                Section("Notes & Citations") {
                    ForEach(citations) { page in
                        pageRow(page)
                    }
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Pages")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    let page = appState.addPage(title: "Untitled")
                    appState.selectPage(page)
                } label: {
                    Image(systemName: "plus")
                }
                .help("New Page")
            }
        }
    }

    @ViewBuilder
    func pageRow(_ page: DocumentPage) -> some View {
        if editingId == page.id {
            TextField("Page title", text: $editTitle)
                .textFieldStyle(.plain)
                .onSubmit {
                    page.title = editTitle
                    editingId = nil
                }
                .onExitCommand {
                    editingId = nil
                }
        } else {
            Label {
                VStack(alignment: .leading, spacing: 1) {
                    Text(page.title)
                        .lineLimit(1)
                    if page.isCitationPage, let n = page.citationNumber {
                        Text("Note \(n)")
                            .font(.caption2)
                            .foregroundStyle(.indigo)
                    }
                }
            } icon: {
                Image(systemName: page.isCitationPage ? "doc.badge.arrow.up" : "doc.text")
                    .foregroundStyle(page.isCitationPage ? .indigo : .secondary)
            }
            .tag(page.id)
            .contextMenu {
                Button("Rename") {
                    editTitle = page.title
                    editingId = page.id
                }
                Divider()
                Button("Delete", role: .destructive) {
                    appState.deletePage(page)
                }
                .disabled(appState.pages.filter { !$0.isCitationPage }.count <= 1 && !page.isCitationPage)
            }
        }
    }
}
