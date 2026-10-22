package com.example.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val CampusDarkColorScheme = darkColorScheme(
    primary = CyanNeon,
    onPrimary = NavyDeep,
    primaryContainer = NavySurface,
    onPrimaryContainer = CyanNeon,
    secondary = PurpleAccent,
    onSecondary = Color.White,
    secondaryContainer = NavyCard,
    onSecondaryContainer = PurpleNeon,
    tertiary = EmeraldSuccess,
    onTertiary = Color.White,
    background = NavyDeep,
    onBackground = TextPrimaryDark,
    surface = NavyDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = NavySurface,
    onSurfaceVariant = TextSecondaryDark,
    outline = NavyBorder,
    error = RoseEmergency,
    onError = Color.White
)

val CampusLightColorScheme = lightColorScheme(
    primary = Color(0xFF0284C7),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE0F2FE),
    onPrimaryContainer = Color(0xFF0369A1),
    secondary = Color(0xFF7C3AED),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFEDE9FE),
    onSecondaryContainer = Color(0xFF5B21B6),
    tertiary = Color(0xFF059669),
    onTertiary = Color.White,
    background = LightBg,
    onBackground = TextPrimaryLight,
    surface = LightSurface,
    onSurface = TextPrimaryLight,
    surfaceVariant = LightCard,
    onSurfaceVariant = TextSecondaryLight,
    outline = LightBorder,
    error = Color(0xFFDC2626),
    onError = Color.White
)

val HighContrastDarkColorScheme = darkColorScheme(
    primary = Color(0xFF00FFFF),
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF002233),
    onPrimaryContainer = Color(0xFF00FFFF),
    secondary = Color(0xFFFF00FF),
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFF330033),
    onSecondaryContainer = Color(0xFFFF00FF),
    tertiary = Color(0xFF00FF66),
    onTertiary = Color.Black,
    background = Color.Black,
    onBackground = Color.White,
    surface = Color(0xFF121212),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF1E1E1E),
    onSurfaceVariant = Color.White,
    outline = Color.White,
    error = Color(0xFFFF3333),
    onError = Color.Black
)

@Composable
fun CampusNavigatorTheme(
    darkTheme: Boolean = true,
    highContrast: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        highContrast -> HighContrastDarkColorScheme
        darkTheme -> CampusDarkColorScheme
        else -> CampusLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
