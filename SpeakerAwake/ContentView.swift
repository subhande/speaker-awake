import SwiftUI

struct ContentView: View {
    @ObservedObject var audioKeepAlive: AudioKeepAlive
    @State private var selectedInterval: TimeInterval
    @State private var launchAtLogin: Bool

    init(audioKeepAlive: AudioKeepAlive) {
        self.audioKeepAlive = audioKeepAlive
        _selectedInterval = State(initialValue: audioKeepAlive.interval)
        _launchAtLogin = State(initialValue: LaunchAtLogin.isEnabled)
    }

    var body: some View {
        VStack(spacing: 0) {
            headerSection
            Divider()
            intervalSection
            Divider()
            loginItemSection
            Divider()
            footerSection
        }
        .frame(width: 280)
    }

    // MARK: - Sections

    private var headerSection: some View {
        HStack(spacing: 12) {
            statusIcon
            titleStack
            Spacer()
            Toggle("", isOn: Binding(
                get: { audioKeepAlive.isRunning },
                set: { $0 ? audioKeepAlive.start() : audioKeepAlive.stop() }
            ))
            .toggleStyle(.switch)
            .labelsHidden()
        }
        .padding(16)
    }

    private var intervalSection: some View {
        HStack {
            Text("Ping interval")
                .font(.subheadline)
            Spacer()
            Picker("", selection: $selectedInterval) {
                ForEach(AudioKeepAlive.availableIntervals, id: \.seconds) { item in
                    Text(item.label).tag(item.seconds)
                }
            }
            .pickerStyle(.menu)
            .labelsHidden()
            .frame(width: 130)
            .onChange(of: selectedInterval) { _, newValue in
                audioKeepAlive.updateInterval(newValue)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var loginItemSection: some View {
        HStack {
            Text("Launch at Login")
                .font(.subheadline)
            Spacer()
            Toggle("", isOn: $launchAtLogin)
                .toggleStyle(.switch)
                .labelsHidden()
                .onChange(of: launchAtLogin) { _, newValue in
                    LaunchAtLogin.setEnabled(newValue)
                }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var footerSection: some View {
        HStack {
            lastPingLabel
            Spacer()
            Button("Quit") { NSApp.terminate(nil) }
                .buttonStyle(.plain)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
    }

    // MARK: - Sub-views

    private var statusIcon: some View {
        ZStack {
            Circle()
                .fill(audioKeepAlive.isRunning
                    ? Color.green.opacity(0.15)
                    : Color.secondary.opacity(0.1))
                .frame(width: 38, height: 38)
            Image(systemName: audioKeepAlive.isRunning
                ? "speaker.wave.2.fill"
                : "speaker.slash.fill")
                .font(.system(size: 17, weight: .medium))
                .foregroundStyle(audioKeepAlive.isRunning ? Color.green : Color.secondary)
        }
    }

    private var titleStack: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Speaker Awake")
                .font(.headline)
            Text(audioKeepAlive.isRunning ? "Keeping speakers awake" : "Speakers may sleep")
                .font(.caption)
                .foregroundStyle(audioKeepAlive.isRunning ? Color.green : Color.secondary)
        }
    }

    @ViewBuilder
    private var lastPingLabel: some View {
        if let lastPing = audioKeepAlive.lastPingTime {
            HStack(spacing: 4) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                    .font(.caption)
                (Text("Last ping: ") + Text(lastPing, style: .relative))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        } else {
            Text(audioKeepAlive.isRunning ? "Starting…" : "Not active")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
