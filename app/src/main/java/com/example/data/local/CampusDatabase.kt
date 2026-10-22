package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        CollegeEntity::class,
        RoomEntity::class,
        EdgeEntity::class,
        TimetableEntity::class,
        AnnouncementEntity::class,
        FavoriteEntity::class,
        EmergencyContactEntity::class,
        AnalyticsEntity::class,
        CampusPhotoEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class CampusDatabase : RoomDatabase() {
    abstract fun campusDao(): CampusDao

    companion object {
        @Volatile
        private var INSTANCE: CampusDatabase? = null

        fun getDatabase(context: Context): CampusDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CampusDatabase::class.java,
                    "campus_navigator_database"
                )
                    .fallbackToDestructiveMigration(dropAllTables = true)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
