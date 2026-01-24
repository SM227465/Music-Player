package expo.modules.mediacontrols

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class MusicPlaybackService : Service() {
    private val notificationId = 1 // Use same ID as media notification
    private val channelId = "music_playback"
    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        private var instance: MusicPlaybackService? = null

        fun getInstance(): MusicPlaybackService? = instance
    }

    fun stopForegroundNotification() {
        try {
            stopForeground(true)
        } catch (e: Exception) {
            // Ignore
        }
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        // Don't create notification channel - use the same channel as ExpoMediaControlsModule
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // On Android O+, we must call startForeground within 5 seconds of startForegroundService
        // We'll start with a minimal notification and it will be replaced by the media notification
        startForegroundWithMinimalNotification()
        return START_STICKY
    }

    private fun startForegroundWithMinimalNotification() {
        val notificationIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Melodify")
            .setContentText("Preparing audio...")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(false)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
        } else {
            startForeground(1, notification)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        releaseWakeLock()
    }



    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "MusicPlayer::PlaybackServiceWakeLock"
            )
            wakeLock?.setReferenceCounted(false)
            // Acquire wake lock for a long duration to ensure continuous playback
            // The wake lock will be released when the service is destroyed
            wakeLock?.acquire(10 * 60 * 60 * 1000L) // 10 hours
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun renewWakeLock() {
        try {
            wakeLock?.let {
                if (!it.isHeld) {
                    it.acquire(10 * 60 * 60 * 1000L) // 10 hours
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
    }

    private fun releaseWakeLock() {
        try {
            wakeLock?.let {
                if (it.isHeld) {
                    it.release()
                }
            }
            wakeLock = null
        } catch (e: Exception) {
            // Ignore
        }
    }
}
