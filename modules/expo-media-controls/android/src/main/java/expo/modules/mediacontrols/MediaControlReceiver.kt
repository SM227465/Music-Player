package expo.modules.mediacontrols

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.support.v4.media.session.MediaControllerCompat

class MediaControlReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        context ?: return

        // Get the active MediaSession from ExpoMediaControlsModule
        val mediaController = getMediaController(context) ?: return

        when (intent?.action) {
            "PLAY" -> {
                mediaController.transportControls.play()
            }
            "PAUSE" -> {
                mediaController.transportControls.pause()
            }
            "NEXT" -> {
                mediaController.transportControls.skipToNext()
            }
            "PREVIOUS" -> {
                mediaController.transportControls.skipToPrevious()
            }
        }
    }

    private fun getMediaController(context: Context): MediaControllerCompat? {
        return try {
            // Access the MediaSession from the module singleton
            ExpoMediaControlsModule.getMediaController(context)
        } catch (e: Exception) {
            null
        }
    }
}
