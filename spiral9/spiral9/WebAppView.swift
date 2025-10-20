import SwiftUI
import WebKit

public struct WebAppView: NSViewRepresentable {
    public init() {}

    // MARK: - Coordinator handles fallback when dev server isn't reachable
    public class Coordinator: NSObject, WKNavigationDelegate {
        weak var webView: WKWebView?
        private var hasFallenBackToBundle = false

        public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            // If dev server load fails, fall back to bundled web app once.
            guard !hasFallenBackToBundle else { return }
            if let url = webView.url, url.host == "localhost" || url.host == "127.0.0.1" {
                hasFallenBackToBundle = true
                WebAppView.loadBundledApp(into: webView)
            }
        }
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    public func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(Bridge.shared, name: "native")

        let view = WKWebView(frame: .zero, configuration: config)
        view.setValue(false, forKey: "drawsBackground")

        // Attach bridge and navigation delegate
        Bridge.shared.attach(webView: view)
        context.coordinator.webView = view
        view.navigationDelegate = context.coordinator

        // Try dev server first; on failure, delegate falls back to bundled app
        WebAppView.loadDevServer(into: view)

        return view
    }

    public func updateNSView(_ nsView: WKWebView, context: Context) {}

    // MARK: - Loading helpers

    /// Attempt to load the Vite dev server; delegate will fall back on failure.
    private static func loadDevServer(into webView: WKWebView) {
        guard let devURL = URL(string: "http://localhost:5173") else {
            loadBundledApp(into: webView)
            return
        }
        let request = URLRequest(url: devURL, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData)
        webView.load(request)
    }

    /// Load the packaged web app from the bundle's `web/` folder reference.
    static func loadBundledApp(into webView: WKWebView) {
        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "web") else {
            // Nothing to load; optionally show a simple HTML error
            let html = """
            <html><body style='background:#1e1e1e;color:#ddd;font:14px -apple-system,Helvetica'>
            <h3>No bundled web app found</h3>
            <p>Expected <code>web/index.html</code> inside the app bundle.</p>
            </body></html>
            """
            webView.loadHTMLString(html, baseURL: nil)
            return
        }
        let readAccess = indexURL.deletingLastPathComponent()
        webView.loadFileURL(indexURL, allowingReadAccessTo: readAccess)
    }
}
