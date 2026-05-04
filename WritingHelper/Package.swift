// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WritingHelper",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(
            name: "WritingHelper",
            path: "Sources/WritingHelper"
        )
    ]
)
