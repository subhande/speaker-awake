import AppKit
import SwiftUI
import Combine

class StatusBarController: NSObject {
    private let statusItem: NSStatusItem
    private let popover: NSPopover
    let audioKeepAlive: AudioKeepAlive
    private var cancellables = Set<AnyCancellable>()

    override init() {
        audioKeepAlive = AudioKeepAlive()
        popover = NSPopover()
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        super.init()
        setupButton()
        setupPopover()
        observeRunningState()
    }

    // MARK: - Setup

    private func setupButton() {
        guard let button = statusItem.button else { return }
        button.image = menuBarImage(running: audioKeepAlive.isRunning)
        button.action = #selector(togglePopover)
        button.target = self
    }

    private func setupPopover() {
        popover.behavior = .transient
        let hostingController = NSHostingController(rootView: ContentView(audioKeepAlive: audioKeepAlive))
        hostingController.sizingOptions = [.preferredContentSize]
        popover.contentViewController = hostingController
    }

    private func observeRunningState() {
        audioKeepAlive.$isRunning
            .receive(on: DispatchQueue.main)
            .sink { [weak self] running in
                self?.statusItem.button?.image = self?.menuBarImage(running: running)
            }
            .store(in: &cancellables)
    }

    // MARK: - Actions

    @objc private func togglePopover() {
        if popover.isShown {
            popover.performClose(nil)
        } else if let button = statusItem.button {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            popover.contentViewController?.view.window?.makeKey()
        }
    }

    func cleanup() {
        audioKeepAlive.stop()
    }

    // MARK: - Helpers

    private func menuBarImage(running: Bool) -> NSImage? {
        let name = running ? "SpeakerOn" : "SpeakerOff"
        let image = NSImage(named: name)
        image?.isTemplate = true
        return image
    }
}
