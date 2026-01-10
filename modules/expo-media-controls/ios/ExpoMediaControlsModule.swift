import ExpoModulesCore
import MediaPlayer
import AVFoundation

public class ExpoMediaControlsModule: Module {
    private var nowPlayingInfo: [String: Any] = [:]

    public func definition() -> ModuleDefinition {
        Name("ExpoMediaControls")

        Events("onPlay", "onPause", "onNext", "onPrevious", "onSeek", "onStop")

        OnCreate {
            setupRemoteTransportControls()
            setupAudioSession()
        }

        OnDestroy {
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
            removeRemoteTransportControls()
        }

        AsyncFunction("updateNowPlaying") { (title: String, artist: String, album: String, artworkUrl: String?, duration: Double, promise: Promise) in
            Task {
                do {
                    var info: [String: Any] = [
                        MPMediaItemPropertyTitle: title,
                        MPMediaItemPropertyArtist: artist,
                        MPMediaItemPropertyAlbumTitle: album,
                        MPMediaItemPropertyPlaybackDuration: duration,
                        MPNowPlayingInfoPropertyElapsedPlaybackTime: 0
                    ]

                    if let urlString = artworkUrl, let url = URL(string: urlString) {
                        if let imageData = try? Data(contentsOf: url),
                           let image = UIImage(data: imageData) {
                            let artwork = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
                            info[MPMediaItemPropertyArtwork] = artwork
                        }
                    }

                    self.nowPlayingInfo = info
                    MPNowPlayingInfoCenter.default().nowPlayingInfo = info
                    promise.resolve(true)
                } catch {
                    promise.reject("UPDATE_ERROR", "Failed to update now playing: \(error.localizedDescription)")
                }
            }
        }

        AsyncFunction("updatePlaybackState") { (isPlaying: Bool, position: Double, promise: Promise) in
            do {
                self.nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = position
                self.nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = isPlaying ? 1.0 : 0.0
                MPNowPlayingInfoCenter.default().nowPlayingInfo = self.nowPlayingInfo
                promise.resolve(true)
            } catch {
                promise.reject("UPDATE_ERROR", "Failed to update playback state: \(error.localizedDescription)")
            }
        }

        AsyncFunction("clearNowPlaying") { (promise: Promise) in
            do {
                MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
                self.nowPlayingInfo = [:]
                promise.resolve(true)
            } catch {
                promise.reject("CLEAR_ERROR", "Failed to clear now playing: \(error.localizedDescription)")
            }
        }

        AsyncFunction("setActive") { (active: Bool, promise: Promise) in
            do {
                if active {
                    try AVAudioSession.sharedInstance().setActive(true)
                } else {
                    try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
                }
                promise.resolve(true)
            } catch {
                promise.reject("SET_ACTIVE_ERROR", "Failed to set active state: \(error.localizedDescription)")
            }
        }
    }

    private func setupAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .default, options: [])
            try audioSession.setActive(true)
        } catch {
            print("Failed to setup audio session: \(error.localizedDescription)")
        }
    }

    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()

        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { [weak self] event in
            self?.sendEvent("onPlay", [:])
            return .success
        }

        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { [weak self] event in
            self?.sendEvent("onPause", [:])
            return .success
        }

        commandCenter.nextTrackCommand.isEnabled = true
        commandCenter.nextTrackCommand.addTarget { [weak self] event in
            self?.sendEvent("onNext", [:])
            return .success
        }

        commandCenter.previousTrackCommand.isEnabled = true
        commandCenter.previousTrackCommand.addTarget { [weak self] event in
            self?.sendEvent("onPrevious", [:])
            return .success
        }

        commandCenter.changePlaybackPositionCommand.isEnabled = true
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            if let event = event as? MPChangePlaybackPositionCommandEvent {
                self?.sendEvent("onSeek", ["position": event.positionTime])
            }
            return .success
        }

        commandCenter.stopCommand.isEnabled = true
        commandCenter.stopCommand.addTarget { [weak self] event in
            self?.sendEvent("onStop", [:])
            return .success
        }
    }

    private func removeRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        commandCenter.playCommand.removeTarget(nil)
        commandCenter.pauseCommand.removeTarget(nil)
        commandCenter.nextTrackCommand.removeTarget(nil)
        commandCenter.previousTrackCommand.removeTarget(nil)
        commandCenter.changePlaybackPositionCommand.removeTarget(nil)
        commandCenter.stopCommand.removeTarget(nil)
    }
}
