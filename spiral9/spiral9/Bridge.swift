import Foundation
import WebKit

public final class Bridge: NSObject, WKScriptMessageHandler {
    public static let shared = Bridge()
    private override init() { super.init() }

    private weak var webView: WKWebView?

    public func attach(webView: WKWebView) {
        self.webView = webView
    }

    // MARK: - Web -> Native
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "native" else { return }
        guard let dict = message.body as? [String: Any],
              let type = dict["type"] as? String else { return }

        switch type {
        case "openWorkspace":
            WorkspaceCoordinator.shared.openWorkspace()
        case "listDir":
            if let path = (dict["payload"] as? [String: Any])?["path"] as? String {
                WorkspaceCoordinator.shared.listDir(path: path)
            }
        case "readFile":
            if let path = (dict["payload"] as? [String: Any])?["path"] as? String {
                WorkspaceCoordinator.shared.readFile(path: path)
            }
        case "writeFile":
            if let p = dict["payload"] as? [String: Any],
               let path = p["path"] as? String,
               let content = p["content"] as? String {
                WorkspaceCoordinator.shared.writeFile(path: path, content: content)
            }
        case "compareFiles":
            if let p = dict["payload"] as? [String: Any],
               let left = p["leftPath"] as? String,
               let right = p["rightPath"] as? String {
                WorkspaceCoordinator.shared.compareFiles(left: left, right: right)
            }
        default:
            break
        }
    }

    // MARK: - Native -> Web
    // MARK: - Native -> Web
    public func send(event: String, payload: [String: Any] = [:]) {
        guard let webView = webView else { return }
        guard let data = try? JSONSerialization.data(withJSONObject: ["event": event, "payload": payload]),
              let jsonString = String(data: data, encoding: .utf8)?
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"") else { return }
        let js = "window.__nativeDispatch(JSON.parse(\\\"\(jsonString)\\\"));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
