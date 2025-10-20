import AppKit
import Foundation

public final class WorkspaceCoordinator {
    public static let shared = WorkspaceCoordinator()

    private let bookmarksKey = "Spiral9.bookmarks.workspace"
    private var workspaceURL: URL?

    public func restoreLastWorkspace() {
        if let data = UserDefaults.standard.data(forKey: bookmarksKey),
           let url = BookmarkStore.resolve(data: data) {
            workspaceURL = url
            listDir(url: url)
            Bridge.shared.send(event: "workspaceOpened", payload: ["rootPath": url.path])
        }
    }

    public func openWorkspace() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK, let url = panel.url {
            if let data = BookmarkStore.make(for: url) {
                UserDefaults.standard.set(data, forKey: bookmarksKey)
            }
            workspaceURL = url
            Bridge.shared.send(event: "workspaceOpened", payload: ["rootPath": url.path])
            listDir(url: url)
        }
    }

    public func listDir(path: String) {
        listDir(url: URL(fileURLWithPath: path))
    }

    private func listDir(url: URL, depth: Int = 2) {
        let tree = FileOps.buildTree(url: url, depth: depth)
        Bridge.shared.send(event: "dirListed", payload: ["path": url.path, "tree": tree])
    }

    public func readFile(path: String) {
        let url = URL(fileURLWithPath: path)
        do {
            let data = try Data(contentsOf: url)
            let str = String(data: data, encoding: .utf8) ?? ""
            Bridge.shared.send(event: "fileRead", payload: ["path": path, "content": str])
        } catch {
            Bridge.shared.send(event: "error", payload: ["op": "readFile", "message": error.localizedDescription])
        }
    }

    public func writeFile(path: String, content: String) {
        let url = URL(fileURLWithPath: path)
        do {
            try (content.data(using: .utf8) ?? Data()).write(to: url, options: .atomic)
            Bridge.shared.send(event: "fileWritten", payload: ["path": path])
        } catch {
            Bridge.shared.send(event: "error", payload: ["op": "writeFile", "message": error.localizedDescription])
        }
    }

    public func compareFiles(left: String, right: String) {
        let lURL = URL(fileURLWithPath: left)
        let rURL = URL(fileURLWithPath: right)
        do {
            let l = try String(contentsOf: lURL, encoding: .utf8)
            let r = try String(contentsOf: rURL, encoding: .utf8)
            Bridge.shared.send(event: "filesCompared", payload: [
                "leftPath": left, "rightPath": right,
                "leftContent": l, "rightContent": r
            ])
        } catch {
            Bridge.shared.send(event: "error", payload: ["op": "compareFiles", "message": error.localizedDescription])
        }
    }
}
