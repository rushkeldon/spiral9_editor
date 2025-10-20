import SwiftUI
import WebKit

public struct WebAppView: NSViewRepresentable {
    public init() {}

    public func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(Bridge.shared, name: "native")

        let view = WKWebView(frame: .zero, configuration: config)
        view.setValue(false, forKey: "drawsBackground")
        Bridge.shared.attach(webView: view)
        return view
    }

    public func updateNSView(_ nsView: WKWebView, context: Context) {}
}
