package expo.modules.mediacontrols

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import expo.modules.core.interfaces.services.EventEmitter
import expo.modules.kotlin.AppContext

class MediaControlReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        when (intent?.action) {
            "PLAY" -> {
                // Event will be sent by MediaSession callback
            }
            "PAUSE" -> {
                // Event will be sent by MediaSession callback
            }
            "NEXT" -> {
                // Event will be sent by MediaSession callback
            }
            "PREVIOUS" -> {
                // Event will be sent by MediaSession callback
            }
        }
    }
}
