import AVFoundation
import Combine

class AudioKeepAlive: ObservableObject {
    @Published private(set) var isRunning = false
    @Published private(set) var lastPingTime: Date?

    private(set) var interval: TimeInterval

    static let availableIntervals: [(label: String, seconds: TimeInterval)] = [
        ("15 seconds", 15),
        ("30 seconds", 30),
        ("1 minute", 60),
        ("2 minutes", 120),
        ("5 minutes", 300),
    ]

    private let engine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private var loopBuffer: AVAudioPCMBuffer?
    private var timer: Timer?

    init() {
        let saved = UserDefaults.standard.double(forKey: "pingInterval")
        interval = saved > 0 ? saved : 30
        setupEngine()
        if UserDefaults.standard.bool(forKey: "isEnabled") {
            start()
        }
    }

    // MARK: - Public

    func start() {
        guard !isRunning else { return }
        isRunning = true
        UserDefaults.standard.set(true, forKey: "isEnabled")
        scheduleLoop()
        playerNode.play()
        updatePingTime()
        scheduleTimer()
    }

    func stop() {
        guard isRunning else { return }
        isRunning = false
        UserDefaults.standard.set(false, forKey: "isEnabled")
        playerNode.stop()
        timer?.invalidate()
        timer = nil
    }

    func updateInterval(_ newInterval: TimeInterval) {
        interval = newInterval
        UserDefaults.standard.set(newInterval, forKey: "pingInterval")
        if isRunning {
            timer?.invalidate()
            scheduleTimer()
        }
    }

    // MARK: - Private

    private func setupEngine() {
        let sampleRate: Double = 44100
        let frameCount: AVAudioFrameCount = 4410 // exactly 44 cycles of 440 Hz → seamless loop
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 2),
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount)
        else { return }
        buffer.frameLength = frameCount

        // 440 Hz sine at -120 dBFS — completely inaudible but keeps audio HW active
        let amplitude: Float = 0.000001
        if let L = buffer.floatChannelData?[0], let R = buffer.floatChannelData?[1] {
            for i in 0..<Int(frameCount) {
                let sample = amplitude * sinf(2.0 * .pi * 440.0 * Float(i) / Float(sampleRate))
                L[i] = sample
                R[i] = sample
            }
        }
        loopBuffer = buffer

        engine.attach(playerNode)
        engine.connect(playerNode, to: engine.mainMixerNode, format: format)
        engine.mainMixerNode.outputVolume = 1.0

        try? engine.start()
    }

    private func scheduleLoop() {
        guard let buffer = loopBuffer else { return }
        playerNode.scheduleBuffer(buffer, at: nil, options: .loops, completionHandler: nil)
    }

    private func scheduleTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.updatePingTime()
        }
    }

    private func updatePingTime() {
        DispatchQueue.main.async { self.lastPingTime = Date() }
    }

    deinit {
        stop()
        engine.stop()
    }
}
