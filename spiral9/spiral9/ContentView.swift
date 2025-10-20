//
//  ContentView.swift
//  spiral9
//
//  Created by Keldon Rush on 10/19/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        WebAppView()            // loads your WKWebView host
            .onAppear {
                WorkspaceCoordinator.shared.restoreLastWorkspace()
            }
    }
}
