import Foundation

enum BookmarkStore {
    static func make(for url: URL) -> Data? {
        do {
            return try url.bookmarkData(options: .withSecurityScope,
                                        includingResourceValuesForKeys: nil,
                                        relativeTo: nil)
        } catch {
            return nil
        }
    }

    static func resolve(data: Data) -> URL? {
        var isStale = false
        do {
            let url = try URL(resolvingBookmarkData: data, options: [.withSecurityScope], relativeTo: nil, bookmarkDataIsStale: &isStale)
            if url.startAccessingSecurityScopedResource() {
                return url
            } else {
                return nil
            }
        } catch {
            return nil
        }
    }
}
