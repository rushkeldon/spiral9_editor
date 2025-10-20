import SwiftUI

public struct Spiral9Commands: Commands {
    public init() {}
    public var body: some Commands {
        CommandGroup(after: .newItem) {
            Button("Open Workspace…") {
                WorkspaceCoordinator.shared.openWorkspace()
            }.keyboardShortcut("o", modifiers: [.command])
        }
        CommandGroup(after: .saveItem) {
            Button("Save") {
                // Web should request write with current path; this is a placeholder.
            }.keyboardShortcut("s", modifiers: [.command])
        }
    }
}
