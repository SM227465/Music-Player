package expo.modules.mediacontrols

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.support.v4.media.session.MediaControllerCompat
import android.util.Log

class MediaControlReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        context ?: return

        // Acquire a wake lock to ensure the action is processed even when the screen is off
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "MusicPlayer::MediaControlWakeLock"
        )

        try {
            // Acquire the wake lock for 3 seconds
            wakeLock.acquire(3000L)

            // Get the active MediaSession from ExpoMediaControlsModule
            val mediaController = getMediaController(context)
            if (mediaController == null) {
                Log.e("MediaControlReceiver", "MediaController is null")
                return
            }

            when (intent?.action) {
                "PLAY" -> {
                    Log.d("MediaControlReceiver", "PLAY action received")
                    mediaController.transportControls.play()
                }
                "PAUSE" -> {
                    Log.d("MediaControlReceiver", "PAUSE action received")
                    mediaController.transportControls.pause()
                }
                "NEXT" -> {
                    Log.d("MediaControlReceiver", "NEXT action received")
                    mediaController.transportControls.skipToNext()
                }
                "PREVIOUS" -> {
                    Log.d("MediaControlReceiver", "PREVIOUS action received")
                    mediaController.transportControls.skipToPrevious()
                }
            }
        } catch (e: Exception) {
            Log.e("MediaControlReceiver", "Error handling media control", e)
        } finally {
            // Release the wake lock
            if (wakeLock.isHeld) {
                wakeLock.release()
            }
        }
    }

    private fun getMediaController(context: Context): MediaControllerCompat? {
        return try {
            // Access the MediaSession from the module singleton
            ExpoMediaControlsModule.getMediaController(context)
        } catch (e: Exception) {
            Log.e("MediaControlReceiver", "Error getting MediaController", e)
            null
        }
    }
}
