package com.annaunivnotifications

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject
import java.net.URL
import kotlin.concurrent.thread

class NotificationWidgetProvider : AppWidgetProvider() {

    companion object {
        private const val NOTIFICATIONS_URL = "https://raw.githubusercontent.com/Terrificdatabytes/anna-univ-notifications/main/data/notifications.json"
        private const val COE_URL = "https://coe.annauniv.edu"
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update all widget instances
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        // Fetch notifications in background thread
        thread {
            try {
                val data = fetchNotifications()
                val views = RemoteViews(context.packageName, R.layout.widget_layout)

                // Update widget UI
                if (data != null) {
                    val notifications = data.optJSONArray("notifications")
                    val count = data.optInt("count", 0)

                    views.setTextViewText(R.id.widget_count, "$count new")

                    if (notifications != null && notifications.length() > 0) {
                        val latestNotification = notifications.getJSONObject(0)
                        val title = latestNotification.optString("title", "No notification")
                        views.setTextViewText(R.id.widget_latest_notification, title)
                    } else {
                        views.setTextViewText(
                            R.id.widget_latest_notification,
                            "No notifications available"
                        )
                    }
                } else {
                    views.setTextViewText(R.id.widget_count, "0")
                    views.setTextViewText(
                        R.id.widget_latest_notification,
                        "Unable to fetch notifications"
                    )
                }

                // Set up click intent to open COE website
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(COE_URL))
                val pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                // Update the widget
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun fetchNotifications(): JSONObject? {
        return try {
            val url = URL(NOTIFICATIONS_URL)
            val connection = url.openConnection()
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            val response = connection.getInputStream().bufferedReader().use { it.readText() }
            JSONObject(response)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override fun onEnabled(context: Context) {
        // Called when the first widget is created
        super.onEnabled(context)
    }

    override fun onDisabled(context: Context) {
        // Called when the last widget is removed
        super.onDisabled(context)
    }
}
