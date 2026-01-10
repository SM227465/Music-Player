package expo.modules.mediacontrols

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.support.v4.media.MediaMetadataCompat
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
    private var mediaSession: MediaSessionCompat? = null
    private val notificationId = 1
    private val channelId = "music_playback"
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun definition() = ModuleDefinition {
        Name("ExpoMediaControls")

        Events("onPlay", "onPause", "onNext", "onPrevious", "onSeek", "onStop")

        OnCreate {
            createNotificationChannel()
            initializeMediaSession()
        }

        OnDestroy {
            mediaSession?.release()
            mediaSession = null
        }

        AsyncFunction("updateNowPlaying") { title: String, artist: String, album: String, artworkUrl: String?, duration: Double, promise: Promise ->
            scope.launch {
                try {
                    val artwork = artworkUrl?.let { loadBitmapFromUrl(it) }
                    updateMediaMetadata(title, artist, album, artwork, duration.toLong())
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

                // Update notification
                val metadata = mediaSession?.controller?.metadata
                val title = metadata?.getString(MediaMetadataCompat.METADATA_KEY_TITLE) ?: ""
                val artist = metadata?.getString(MediaMetadataCompat.METADATA_KEY_ARTIST) ?: ""
                val artwork = metadata?.getBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART)
                showNotification(title, artist, artwork, isPlaying)

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("UPDATE_ERROR", "Failed to update playback state: ${e.message}", e)
            }
        }

        AsyncFunction("clearNowPlaying") { promise: Promise ->
            try {
                mediaSession?.isActive = false
                val notificationManager = NotificationManagerCompat.from(appContext.reactContext!!)
                notificationManager.cancel(notificationId)
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
            .setState(state, position * 1000, 1.0f)
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

        val notification = NotificationCompat.Builder(context, channelId)
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
            .build()

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
}
