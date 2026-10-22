package com.example.domain.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class VoiceNavigationManager(context: Context) {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    private val _isTamilAvailable = MutableStateFlow(false)
    val isTamilAvailable: StateFlow<Boolean> = _isTamilAvailable.asStateFlow()

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                isInitialized = true
                val tamilLocale = Locale("ta", "IN")
                val tamilResult = tts?.isLanguageAvailable(tamilLocale)
                _isTamilAvailable.value = (tamilResult == TextToSpeech.LANG_AVAILABLE ||
                        tamilResult == TextToSpeech.LANG_COUNTRY_AVAILABLE)

                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        _isSpeaking.value = true
                    }

                    override fun onDone(utteranceId: String?) {
                        _isSpeaking.value = false
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) {
                        _isSpeaking.value = false
                    }
                })
            } else {
                Log.w("VoiceNav", "TTS Initialization failed with code $status")
            }
        }
    }

    fun speak(text: String, language: String = "English", speedRate: Float = 1.0f) {
        if (!isInitialized || tts == null || text.isBlank()) return

        try {
            if (language.equals("Tamil", ignoreCase = true)) {
                val tamilLocale = Locale("ta", "IN")
                val result = tts?.setLanguage(tamilLocale)
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    // Graceful fallback to English if Tamil voice pack not installed
                    tts?.language = Locale.US
                }
            } else {
                tts?.language = Locale.US
            }

            tts?.setSpeechRate(speedRate.coerceIn(0.5f, 2.0f))
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "UTTERANCE_${System.currentTimeMillis()}")
        } catch (e: Exception) {
            Log.e("VoiceNav", "Speech synthesis failed", e)
        }
    }

    fun stop() {
        tts?.stop()
        _isSpeaking.value = false
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isInitialized = false
    }
}
