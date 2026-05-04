import SwiftUI
import AppKit

// MARK: - SwiftUI wrapper

struct CanvasView: NSViewRepresentable {
    @Environment(AppState.self) private var appState

    func makeCoordinator() -> Coordinator { MainActor.assumeIsolated { Coordinator() } }

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSTextView.scrollableTextView()
        guard let tv = scrollView.documentView as? NSTextView else { return scrollView }

        tv.isEditable = true
        tv.isRichText = true
        tv.allowsUndo = true
        tv.usesFindPanel = true
        tv.isAutomaticSpellingCorrectionEnabled = true
        tv.isAutomaticQuoteSubstitutionEnabled = false
        tv.isGrammarCheckingEnabled = true
        tv.textContainerInset = NSSize(width: 72, height: 72)
        tv.font = NSFont.systemFont(ofSize: 16)
        tv.backgroundColor = .textBackgroundColor

        tv.delegate = context.coordinator
        context.coordinator.setup(tv: tv, appState: appState)

        return scrollView
    }

    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        guard let tv = scrollView.documentView as? NSTextView else { return }
        context.coordinator.update(tv: tv, appState: appState)
    }
}

// MARK: - Coordinator

@MainActor
final class Coordinator: NSObject, NSTextViewDelegate {
    private weak var tv: NSTextView?
    private var appState: AppState!
    private var loadedPageId: UUID?
    private var saveDebounce: Task<Void, Never>?

    func setup(tv: NSTextView, appState: AppState) {
        self.tv = tv
        self.appState = appState
        loadedPageId = appState.currentPageId

        // Load initial page
        loadPage(appState.currentPage)

        // Register canvas operations with AppState
        appState.canvasInsert = { [weak self] text in
            guard let tv = self?.tv else { return }
            // Insert at end, preserving undo
            let loc = tv.textStorage?.length ?? 0
            let typingAttrs = tv.typingAttributes
            let attrs: [NSAttributedString.Key: Any] = [
                .font: typingAttrs[.font] as? NSFont ?? NSFont.systemFont(ofSize: 16),
                .foregroundColor: typingAttrs[.foregroundColor] as? NSColor ?? .textColor,
            ]
            let str = NSAttributedString(string: text, attributes: attrs)
            tv.insertText(str, replacementRange: NSRange(location: loc, length: 0))
            tv.scrollToEndOfDocument(nil)
        }

        appState.canvasGetText = { [weak self] in
            self?.tv?.string ?? ""
        }

        appState.canvasSwitchPage = { [weak self] page in
            self?.switchTo(page)
        }

        appState.canvasScrollTo = { [weak self] range in
            guard let tv = self?.tv else { return }
            tv.scrollRangeToVisible(range)
            tv.showFindIndicator(for: range)
        }

        appState.canvasInsertCitation = { [weak self] num, pageId, location in
            guard let tv = self?.tv else { return }
            let scheme = "writinghelper://citation/\(pageId.uuidString)"
            let citStr = NSAttributedString(
                string: " [\(num)]",
                attributes: [
                    .font: NSFont.systemFont(ofSize: 12, weight: .semibold),
                    .foregroundColor: NSColor.systemBlue,
                    .link: NSURL(string: scheme)!,
                    .underlineStyle: NSUnderlineStyle.single.rawValue,
                    .underlineColor: NSColor.systemBlue,
                ]
            )
            let safeLoc = min(location, tv.textStorage?.length ?? 0)
            tv.insertText(citStr, replacementRange: NSRange(location: safeLoc, length: 0))
        }
    }

    func update(tv: NSTextView, appState: AppState) {
        self.appState = appState

        // Switch page when selection changes
        if loadedPageId != appState.currentPageId {
            if let oldId = loadedPageId,
               let old = appState.pages.first(where: { $0.id == oldId }) {
                savePageNow(to: old, tv: tv)
            }
            loadPage(appState.currentPage)
        }

        // Re-apply comment highlights (cheap: only NSLayoutManager temporary attrs)
        applyHighlights(tv: tv)
    }

    // MARK: - Page load/save

    private func loadPage(_ page: DocumentPage?) {
        guard let tv = tv, let page = page else { return }
        tv.textStorage?.beginEditing()
        if let data = page.rtfData,
           let attr = NSAttributedString(rtf: data, documentAttributes: nil) {
            tv.textStorage?.setAttributedString(attr)
        } else {
            tv.textStorage?.setAttributedString(NSAttributedString())
        }
        tv.textStorage?.endEditing()
        tv.undoManager?.removeAllActions()   // fresh undo stack per page
        loadedPageId = page.id
    }

    private func savePageNow(to page: DocumentPage, tv: NSTextView) {
        guard let storage = tv.textStorage else { return }
        page.rtfData = storage.rtf(
            from: NSRange(location: 0, length: storage.length),
            documentAttributes: [:]
        )
    }

    private func switchTo(_ page: DocumentPage) {
        guard let tv = tv else { return }
        if let oldId = loadedPageId,
           let old = appState.pages.first(where: { $0.id == oldId }) {
            savePageNow(to: old, tv: tv)
        }
        loadPage(page)
    }

    // MARK: - Comment highlights

    private func applyHighlights(tv: NSTextView) {
        guard let lm = tv.layoutManager else { return }
        let len = tv.string.count
        guard len > 0 else { return }
        let full = NSRange(location: 0, length: len)

        lm.removeTemporaryAttribute(.backgroundColor,  forCharacterRange: full)
        lm.removeTemporaryAttribute(.underlineStyle,   forCharacterRange: full)
        lm.removeTemporaryAttribute(.underlineColor,   forCharacterRange: full)

        for comment in appState.comments where comment.pageId == appState.currentPageId {
            let r = comment.range
            guard r.location + r.length <= len else { continue }
            let selected = comment.id == appState.selectedCommentId
            lm.addTemporaryAttribute(.backgroundColor,
                value: NSColor.systemYellow.withAlphaComponent(selected ? 0.45 : 0.22),
                forCharacterRange: r)
            lm.addTemporaryAttribute(.underlineStyle,
                value: NSUnderlineStyle.single.rawValue,
                forCharacterRange: r)
            lm.addTemporaryAttribute(.underlineColor,
                value: NSColor.systemOrange,
                forCharacterRange: r)
        }
    }

    // MARK: - NSTextViewDelegate

    func textDidChange(_ notification: Notification) {
        guard let tv = notification.object as? NSTextView,
              let pageId = loadedPageId,
              let page = appState.pages.first(where: { $0.id == pageId }) else { return }

        // Debounced save to avoid saving every keystroke
        saveDebounce?.cancel()
        saveDebounce = Task { @MainActor [weak self] in
            try? await Task.sleep(for: .milliseconds(400))
            guard !Task.isCancelled, let self = self else { return }
            self.savePageNow(to: page, tv: tv)
        }
    }

    // Custom right-click menu: inject "Add Comment" when text is selected
    func textView(_ textView: NSTextView, menu: NSMenu,
                  for event: NSEvent, at charIndex: Int) -> NSMenu? {
        let range = textView.selectedRange()

        // If clicking on an existing comment range, show "Open Comment"
        let pageComments = appState.comments.filter { $0.pageId == appState.currentPageId }
        if let hit = pageComments.first(where: { NSLocationInRange(charIndex, $0.range) }) {
            let open = NSMenuItem(title: "Open Comment Thread",
                                  action: #selector(openCommentThread(_:)),
                                  keyEquivalent: "")
            open.target = self
            open.representedObject = hit.id.uuidString
            menu.insertItem(open, at: 0)
            menu.insertItem(.separator(), at: 1)
        }

        // If text is selected, show "Add Comment"
        if range.length > 0 {
            let add = NSMenuItem(title: "Add Comment…",
                                 action: #selector(addCommentAction),
                                 keyEquivalent: "")
            add.target = self
            menu.insertItem(add, at: 0)
            if !pageComments.isEmpty { menu.insertItem(.separator(), at: 1) }
        }

        return menu
    }

    @objc func addCommentAction() {
        guard let tv = tv else { return }
        let range = tv.selectedRange()
        guard range.length > 0 else { return }
        let text = (tv.string as NSString).substring(with: range)
        Task { @MainActor [weak self] in
            self?.appState.addComment(selectedText: text, range: range)
        }
    }

    @objc func openCommentThread(_ sender: NSMenuItem) {
        guard let idStr = sender.representedObject as? String,
              let uuid = UUID(uuidString: idStr) else { return }
        Task { @MainActor [weak self] in
            self?.appState.selectedCommentId = uuid
            self?.appState.rightPanel = .comments
        }
    }

    // Handle citation link clicks
    func textView(_ textView: NSTextView, clickedOnLink link: Any, at charIndex: Int) -> Bool {
        guard let url = (link as? URL) ?? (link as? NSURL)?.absoluteURL,
              url.scheme == "writinghelper",
              url.host == "citation",
              let idStr = url.pathComponents.last,
              let pageId = UUID(uuidString: idStr),
              let page = appState.pages.first(where: { $0.id == pageId }) else {
            return false
        }
        Task { @MainActor [weak self] in
            self?.appState.selectPage(page)
        }
        return true
    }

    func textViewDidChangeSelection(_ notification: Notification) {
        // Could show a formatting popover here in the future
    }
}
