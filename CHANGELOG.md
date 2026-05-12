# Changelog

All notable changes to Speaker Awake are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-05-12

### Added
- Menu bar app with on/off toggle
- AVAudioEngine keep-alive: loops a −120 dBFS 440 Hz sine tone to hold audio hardware active
- Configurable ping interval (15 s / 30 s / 1 min / 2 min / 5 min)
- "Last ping" live counter in the popover footer
- Launch at Login toggle via `SMAppService`
- Settings persistence (interval and enabled state) via `UserDefaults`
- Menu bar icon reflects active/inactive state (custom template images `SpeakerOn` / `SpeakerOff` in `Assets.xcassets`)
- Popover auto-sizes to content using `NSHostingController.sizingOptions`
- macOS 14.0+ deployment target; Apple Silicon and Intel support
