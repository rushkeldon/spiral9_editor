import Foundation

public enum FileOps {
    public static func buildTree(url: URL, depth: Int) -> [[String: Any]] {
        var nodes: [[String: Any]] = []
        let fm = FileManager.default
        guard let items = try? fm.contentsOfDirectory(at: url, includingPropertiesForKeys: [.isDirectoryKey], options: [.skipsHiddenFiles]) else {
            return nodes
        }
        for child in items.sorted(by: { $0.lastPathComponent.lowercased() < $1.lastPathComponent.lowercased() }) {
            let isDir = (try? child.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) ?? false
            var node: [String: Any] = [
                "path": child.path,
                "name": child.lastPathComponent,
                "isDir": isDir
            ]
            if isDir && depth > 0 {
                node["children"] = buildTree(url: child, depth: depth - 1)
            }
            nodes.append(node)
        }
        return nodes
    }
}
