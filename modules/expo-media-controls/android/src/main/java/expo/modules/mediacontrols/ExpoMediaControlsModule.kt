package expo.modules.mediacontrols

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaControllerCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

class ExpoMediaControlsModule : Module() {
    private val notificationId = 1
    private val channelId = "music_playback"
    private val scope = CoroutineScope(Dispatchers.Main)
    private var lastNotificationBuilder: NotificationCompat.Builder? = null
    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        private var mediaSession: MediaSessionCompat? = null
        private var serviceIntent: Intent? = null

        fun getMediaController(context: Context): MediaControllerCompat? {
            return mediaSession?.controller
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoMediaControls")

        Events("onPlay", "onPause", "onNext", "onPrevious", "onSeek", "onStop")

        OnCreate {
            createNotificationChannel()
            initializeMediaSession()
            acquireWakeLock()
        }

        OnDestroy {
            releaseWakeLock()
            stopForegroundService()
            mediaSession?.release()
            mediaSession = null
        }

        AsyncFunction("updateNowPlaying") { title: String, artist: String, album: String, artworkUrl: String?, duration: Double, promise: Promise ->
            scope.launch {
                try {
                    val artwork = artworkUrl?.let { loadBitmapFromUrl(it) }
                    updateMediaMetadata(title, artist, album, artwork, duration.toLong())
                    startForegroundService()
                    showNotification(title, artist, artwork, true)
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("UPDATE_ERROR", "Failed to update now playing: ${e.message}", e)
                }
            }
        }

        AsyncFunction("updatePlaybackState") { isPlaying: Boolean, position: Double, promise: Promise ->
            try {
                val state = if (isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
                updatePlaybackState(state, position.toLong())

                // Update notification only if it exists
                if (lastNotificationBuilder != null) {
                    val metadata = mediaSession?.controller?.metadata
                    val title = metadata?.getString(MediaMetadataCompat.METADATA_KEY_TITLE) ?: ""
                    val artist = metadata?.getString(MediaMetadataCompat.METADATA_KEY_ARTIST) ?: ""
                    val artwork = metadata?.getBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART)
                    updateNotification(title, artist, artwork, isPlaying)
                }

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("UPDATE_ERROR", "Failed to update playback state: ${e.message}", e)
            }
        }

        AsyncFunction("clearNowPlaying") { promise: Promise ->
            try {
                mediaSession?.isActive = false
                stopForegroundService()
                val notificationManager = NotificationManagerCompat.from(appContext.reactContext!!)
                notificationManager.cancel(notificationId)
                lastNotificationBuilder = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("CLEAR_ERROR", "Failed to clear now playing: ${e.message}", e)
            }
        }

        AsyncFunction("setActive") { active: Boolean, promise: Promise ->
            try {
                mediaSession?.isActive = active
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SET_ACTIVE_ERROR", "Failed to set active state: ${e.message}", e)
            }
        }
    }

    private fun initializeMediaSession() {
        val context = appContext.reactContext ?: return

        mediaSession = MediaSessionCompat(context, "MusicPlayerSession").apply {
            setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
            )

            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() {
                    sendEvent("onPlay", emptyMap<String, Any>())
                }

                override fun onPause() {
                    sendEvent("onPause", emptyMap<String, Any>())
                }

                override fun onSkipToNext() {
                    sendEvent("onNext", emptyMap<String, Any>())
                }

                override fun onSkipToPrevious() {
                    sendEvent("onPrevious", emptyMap<String, Any>())
                }

                override fun onSeekTo(pos: Long) {
                    sendEvent("onSeek", mapOf("position" to pos))
                }

                override fun onStop() {
                    sendEvent("onStop", emptyMap<String, Any>())
                }
            })

            isActive = true
        }
    }

    private fun updateMediaMetadata(title: String, artist: String, album: String, artwork: Bitmap?, duration: Long) {
        val metadata = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration * 1000)
            .apply {
                artwork?.let { putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, it) }
            }
            .build()

        mediaSession?.setMetadata(metadata)
    }

    private fun updatePlaybackState(state: Int, position: Long) {
        // Set playback speed: 1.0f when playing, 0.0f when paused
        // This allows Android to automatically calculate progress without constant updates
        val playbackSpeed = if (state == PlaybackStateCompat.STATE_PLAYING) 1.0f else 0.0f

        val playbackState = PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_PLAY_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_SEEK_TO or
                PlaybackStateCompat.ACTION_STOP
            )
            .setState(state, position * 1000, playbackSpeed, android.os.SystemClock.elapsedRealtime())
            .build()

        mediaSession?.setPlaybackState(playbackState)
    }

    private fun showNotification(title: String, artist: String, artwork: Bitmap?, isPlaying: Boolean) {
        val context = appContext.reactContext ?: return

        val sessionToken = mediaSession?.sessionToken

        val notificationIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val contentIntent = PendingIntent.getActivity(
            context,
            0,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPauseAction = if (isPlaying) {
            NotificationCompat.Action(
                android.R.drawable.ic_media_pause,
                "Pause",
                createPendingIntent(context, "PAUSE")
            )
        } else {
            NotificationCompat.Action(
                android.R.drawable.ic_media_play,
                "Play",
                createPendingIntent(context, "PLAY")
            )
        }

        lastNotificationBuilder = NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setLargeIcon(artwork)
            .setContentIntent(contentIntent)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setStyle(
                androidx.media.app.NotificationCompat.MediaStyle()
                    .setMediaSession(sessionToken)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .addAction(
                android.R.drawable.ic_media_previous,
                "Previous",
                createPendingIntent(context, "PREVIOUS")
            )
            .addAction(playPauseAction)
            .addAction(
                android.R.drawable.ic_media_next,
                "Next",
                createPendingIntent(context, "NEXT")
            )

        val notification = lastNotificationBuilder!!.build()
        val notificationManager = NotificationManagerCompat.from(context)
        notificationManager.notify(notificationId, notification)
    }

    private fun updateNotification(title: String, artist: String, artwork: Bitmap?, isPlaying: Boolean) {
        val context = appContext.reactContext ?: return
        val builder = lastNotificationBuilder ?: return

        val playPauseAction = if (isPlaying) {
            NotificationCompat.Action(
                android.R.drawable.ic_media_pause,
                "Pause",
                createPendingIntent(context, "PAUSE")
            )
        } else {
            NotificationCompat.Action(
                android.R.drawable.ic_media_play,
                "Play",
                createPendingIntent(context, "PLAY")
            )
        }

        // Clear old actions and add new ones
        builder.clearActions()
        builder.addAction(
            android.R.drawable.ic_media_previous,
            "Previous",
            createPendingIntent(context, "PREVIOUS")
        )
        builder.addAction(playPauseAction)
        builder.addAction(
            android.R.drawable.ic_media_next,
            "Next",
            createPendingIntent(context, "NEXT")
        )

        val notification = builder.build()
        val notificationManager = NotificationManagerCompat.from(context)
        notificationManager.notify(notificationId, notification)
    }

    private fun createPendingIntent(context: Context, action: String): PendingIntent {
        val intent = Intent(context, MediaControlReceiver::class.java).apply {
            this.action = action
        }
        return PendingIntent.getBroadcast(
            context,
            action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val context = appContext.reactContext ?: return
            val name = "Music Playback"
            val descriptionText = "Controls for music playback"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(channelId, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private suspend fun loadBitmapFromUrl(url: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connect()
            val input = connection.inputStream
            BitmapFactory.decodeStream(input)
        } catch (e: Exception) {
            null
        }
    }

    private fun acquireWakeLock() {
        val context = appContext.reactContext ?: return
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "MusicPlayer::AudioPlaybackWakeLock"
            )
            wakeLock?.setReferenceCounted(false)
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

    private fun startForegroundService() {
        val context = appContext.reactContext ?: return
        try {
            // Acquire wake lock to keep CPU running during playback
            wakeLock?.let {
                if (!it.isHeld) {
                    it.acquire(60 * 60 * 1000L) // 1 hour timeout
                }
            }

            // Start the foreground service
            val intent = Intent(context, MusicPlaybackService::class.java)
            serviceIntent = intent
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        } catch (e: Exception) {
            // Log but don't crash
            android.util.Log.e("ExpoMediaControls", "Failed to start foreground service", e)
        }
    }

    private fun stopForegroundService() {
        val context = appContext.reactContext ?: return
        try {
            releaseWakeLock()
            serviceIntent?.let {
                context.stopService(it)
            }
            serviceIntent = null
        } catch (e: Exception) {
            // Ignore
        }
    }
}
