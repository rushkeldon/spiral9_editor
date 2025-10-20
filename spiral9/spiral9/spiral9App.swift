//
//  spiral9App.swift
//  spiral9
//
//  Created by Keldon Rush on 10/19/25.
//

import SwiftUI

@main
struct spiral9App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            Spiral9Commands()
        }
    }
}
