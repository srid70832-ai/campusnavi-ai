export class VoiceNavigationManager {
  private static instance: VoiceNavigationManager;
  private synth: SpeechSynthesis | null = null;
  private lastSpokenText: string = '';
  private isEnabled: boolean = true;
  private language: 'en-US' | 'ta-IN' = 'en-US';
  private rate: number = 1.0;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public static getInstance(): VoiceNavigationManager {
    if (!VoiceNavigationManager.instance) {
      VoiceNavigationManager.instance = new VoiceNavigationManager();
    }
    return VoiceNavigationManager.instance;
  }

  public setLanguage(lang: 'English' | 'Tamil'): void {
    this.language = lang === 'Tamil' ? 'ta-IN' : 'en-US';
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public setRate(speed: number): void {
    this.rate = Math.max(0.7, Math.min(1.5, speed));
  }

  public speak(instructionEn: string, instructionTa?: string, force: boolean = false): void {
    if (!this.isEnabled || !this.synth) return;

    const textToSpeak = this.language === 'ta-IN' && instructionTa ? instructionTa : instructionEn;
    if (!force && textToSpeak === this.lastSpokenText) return;

    this.synth.cancel(); // Stop any pending speech
    this.lastSpokenText = textToSpeak;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = this.language;
    utterance.rate = this.rate;

    const voices = this.synth.getVoices();
    if (this.language === 'ta-IN') {
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      const englishVoice = voices.find((v) => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default));
      if (englishVoice) utterance.voice = englishVoice;
    }

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.lastSpokenText = '';
    }
  }
}
