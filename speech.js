/* =========================================================
   AutoInspect AI
   speech.js
   Central Audio + Voice Alert Manager
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectSpeech = (() => {

    const CONFIG = {

        language: "ar",

        speechRate: 0.92,

        speechPitch: 1,

        speechVolume: 1,

        soundVolume: 0.22,

        enabled: true,

        voiceEnabled: true,

        soundEnabled: true

    };


    const DAMAGE_ALERTS = {

        scratch: {
            ar: "تحذير. تم اكتشاف خدش في هيكل المركبة.",
            en: "Warning. A scratch was detected on the vehicle body.",
            frequency: 660,
            duration: 0.18,
            severity: "medium"
        },

        dent: {
            ar: "تحذير. تم اكتشاف انبعاج في هيكل المركبة.",
            en: "Warning. A dent was detected on the vehicle body.",
            frequency: 880,
            duration: 0.22,
            severity: "high"
        },

        crack: {
            ar: "تحذير. تم اكتشاف كسر أو تشقق.",
            en: "Warning. A crack was detected.",
            frequency: 980,
            duration: 0.25,
            severity: "high"
        },

        rust: {
            ar: "تنبيه. تم اكتشاف احتمال وجود صدأ.",
            en: "Alert. Possible rust was detected.",
            frequency: 520,
            duration: 0.18,
            severity: "medium"
        },

        paint: {
            ar: "تنبيه. تم اكتشاف اختلاف محتمل في الطلاء.",
            en: "Alert. A possible paint difference was detected.",
            frequency: 440,
            duration: 0.16,
            severity: "medium"
        }

    };


    const state = {

        audioContext: null,

        lastAlert: 0,

        muted: false,

        speaking: false,

        queue: [],

        processingQueue: false

    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        window.AutoInspectAI.speech =
            api;

        createAudioControls();

        console.log(
            "AutoInspect AI Speech initialized."
        );
    }


    /* =====================================================
       AUDIO CONTEXT
    ===================================================== */

    function getAudioContext() {

        if (
            state.audioContext
        ) {

            return state.audioContext;
        }

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            return null;
        }

        try {

            state.audioContext =
                new AudioContext();

            return state.audioContext;

        } catch (error) {

            console.warn(
                "Web Audio unavailable.",
                error
            );

            return null;
        }
    }


    /* =====================================================
       ENABLE AUDIO AFTER USER ACTION
    ===================================================== */

    async function unlockAudio() {

        const context =
            getAudioContext();

        if (!context) {

            return false;
        }

        try {

            if (
                context.state ===
                "suspended"
            ) {

                await context.resume();
            }

            return true;

        } catch (error) {

            return false;
        }
    }


    /* =====================================================
       PLAY TONE
    ===================================================== */

    async function playTone(
        frequency = 660,
        duration = 0.18,
        type = "sine",
        volume = CONFIG.soundVolume
    ) {

        if (
            !CONFIG.soundEnabled ||
            state.muted
        ) {

            return;
        }

        const context =
            getAudioContext();

        if (!context) {

            return;
        }

        await unlockAudio();

        try {

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();

            oscillator.type =
                type;

            oscillator.frequency.setValueAtTime(
                frequency,
                context.currentTime
            );

            gain.gain.setValueAtTime(
                0.0001,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                volume,
                context.currentTime + 0.025
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                context.currentTime +
                duration
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                context.destination
            );

            oscillator.start();

            oscillator.stop(
                context.currentTime +
                duration +
                0.04
            );

        } catch (error) {

            console.warn(
                "Tone error:",
                error
            );
        }
    }


    /* =====================================================
       PLAY SUCCESS SOUND
    ===================================================== */

    async function success() {

        if (
            !CONFIG.soundEnabled ||
            state.muted
        ) {

            return;
        }

        await playTone(
            660,
            0.12,
            "sine"
        );

        setTimeout(
            () =>
                playTone(
                    880,
                    0.16,
                    "sine"
                ),
            140
        );
    }


    /* =====================================================
       PLAY ERROR SOUND
    ===================================================== */

    async function errorSound() {

        if (
            !CONFIG.soundEnabled ||
            state.muted
        ) {

            return;
        }

        await playTone(
            330,
            0.22,
            "square"
        );

        setTimeout(
            () =>
                playTone(
                    220,
                    0.28,
                    "square"
                ),
            240
        );
    }


    /* =====================================================
       PLAY DAMAGE WARNING
    ===================================================== */

    async function damageAlert(
        type,
        options = {}
    ) {

        const alert =
            DAMAGE_ALERTS[type];

        if (!alert) {

            console.warn(
                "Unknown damage type:",
                type
            );

            return;
        }

        const now =
            Date.now();

        /*
         * Prevent multiple alerts
         * from firing simultaneously.
         */

        if (
            now -
            state.lastAlert <
            800
        ) {

            return;
        }

        state.lastAlert =
            now;


        if (
            CONFIG.soundEnabled &&
            !state.muted
        ) {

            if (
                alert.severity ===
                "high"
            ) {

                await playTone(
                    alert.frequency,
                    alert.duration,
                    "square"
                );

                setTimeout(
                    () =>
                        playTone(
                            alert.frequency *
                            0.72,
                            0.22,
                            "square"
                        ),
                    220
                );

            } else {

                await playTone(
                    alert.frequency,
                    alert.duration,
                    "sine"
                );
            }
        }


        if (
            CONFIG.voiceEnabled &&
            !state.muted
        ) {

            const message =
                options.message ||
                getMessage(
                    type,
                    options.language
                );

            speak(
                message,
                options
            );
        }
    }


    /* =====================================================
       GET MESSAGE
    ===================================================== */

    function getMessage(
        type,
        language
    ) {

        const alert =
            DAMAGE_ALERTS[type];

        if (!alert) {

            return "";
        }

        const lang =
            language ||
            CONFIG.language;

        return (
            lang === "en"
                ? alert.en
                : alert.ar
        );
    }


    /* =====================================================
       SPEAK
    ===================================================== */

    function speak(
        text,
        options = {}
    ) {

        if (
            !CONFIG.voiceEnabled ||
            state.muted ||
            !("speechSynthesis" in window)
        ) {

            return;
        }

        if (!text) {

            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(
                String(text)
            );

        const language =
            options.language ||
            CONFIG.language;

        utterance.lang =
            language === "en"
                ? "en-US"
                : "ar-SA";

        utterance.rate =
            options.rate ??
            CONFIG.speechRate;

        utterance.pitch =
            options.pitch ??
            CONFIG.speechPitch;

        utterance.volume =
            options.volume ??
            CONFIG.speechVolume;


        utterance.onstart =
            () => {

                state.speaking =
                    true;
            };


        utterance.onend =
            () => {

                state.speaking =
                    false;
            };


        utterance.onerror =
            () => {

                state.speaking =
                    false;
            };


        /*
         * لا نترك رسائل قديمة
         * متراكمة في المتصفح.
         */

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            utterance
        );
    }


    /* =====================================================
       SPEAK DAMAGE WITH BODY PART
    ===================================================== */

    function speakDamage(
        type,
        bodyPart,
        confidence = null,
        language = CONFIG.language
    ) {

        const alert =
            DAMAGE_ALERTS[type];

        if (!alert) {

            return;
        }

        let message;

        if (
            language === "en"
        ) {

            message =
                `Warning. ${alert.en}`;

            if (bodyPart) {

                message +=
                    ` Location: ${bodyPart}.`;
            }

            if (
                confidence !== null
            ) {

                message +=
                    ` Confidence ${confidence} percent.`;
            }

        } else {

            message =
                alert.ar;

            if (bodyPart) {

                message +=
                    ` الموقع: ${bodyPart}.`;
            }

            if (
                confidence !== null
            ) {

                message +=
                    ` نسبة الثقة ${confidence} بالمئة.`;
            }
        }

        speak(
            message,
            {
                language
            }
        );
    }


    /* =====================================================
       INSPECTION SUMMARY
    ===================================================== */

    function inspectionSummary(
        summary,
        language = CONFIG.language
    ) {

        if (!summary) {

            return;
        }

        let message;

        if (
            language === "en"
        ) {

            message =
                `Inspection completed. Vehicle health ${summary.health} percent. Damage score ${summary.damageScore} percent.`;

            if (
                summary.totalDetections >
                0
            ) {

                message +=
                    ` ${summary.totalDetections} potential damage findings detected.`;

            } else {

                message +=
                    " No potential damage findings were detected by the current inspection engine.";
            }

        } else {

            message =
                `اكتمل الفحص. صحة المركبة ${summary.health} بالمئة. درجة الأضرار ${summary.damageScore} بالمئة.`;

            if (
                summary.totalDetections >
                0
            ) {

                message +=
                    ` تم اكتشاف ${summary.totalDetections} حالات ضرر محتملة.`;

            } else {

                message +=
                    " لم يتم اكتشاف أضرار محتملة بواسطة محرك الفحص الحالي.";
            }
        }

        speak(
            message,
            {
                language
            }
        );
    }


    /* =====================================================
       ALERT ALL DETECTIONS
    ===================================================== */

    async function announceDetections(
        detections,
        options = {}
    ) {

        if (
            !Array.isArray(
                detections
            ) ||
            !detections.length
        ) {

            return;
        }

        /*
         * إزالة التكرار:
         * لا نريد نطق نفس الضرر عشر مرات
         * إذا ظهر في عدة صور.
         */

        const unique =
            [];

        const keys =
            new Set();

        detections.forEach(
            detection => {

                const key =
                    [
                        detection.type,
                        detection.imageIndex,
                        detection.bodyPart ||
                            ""
                    ].join(
                        ":"
                    );

                if (
                    !keys.has(key)
                ) {

                    keys.add(key);

                    unique.push(
                        detection
                    );
                }
            }
        );


        for (
            const detection of unique
        ) {

            await damageAlert(
                detection.type,
                {
                    language:
                        options.language ||
                        CONFIG.language
                }
            );

            await wait(
                1000
            );
        }
    }


    /* =====================================================
       WAIT
    ===================================================== */

    function wait(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }


    /* =====================================================
       MUTE / UNMUTE
    ===================================================== */

    function toggleMute() {

        state.muted =
            !state.muted;

        if (
            state.muted &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }

        updateMuteButton();

        return state.muted;
    }


    function setMuted(
        value
    ) {

        state.muted =
            Boolean(value);

        if (
            state.muted &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }

        updateMuteButton();
    }


    function updateMuteButton() {

        const buttons =
            document.querySelectorAll(
                "[data-audio-toggle]"
            );

        buttons.forEach(
            button => {

                button.textContent =
                    state.muted
                        ? "🔇 الصوت مكتوم"
                        : "🔊 الصوت يعمل";

                button.setAttribute(
                    "aria-pressed",
                    String(
                        state.muted
                    )
                );
            }
        );
    }


    /* =====================================================
       AUDIO CONTROLS
    ===================================================== */

    function createAudioControls() {

        /*
         * إذا أضافت الصفحة زرًا يدويًا
         * باستخدام data-audio-toggle
         * سيتم ربطه تلقائيًا.
         */

        const buttons =
            document.querySelectorAll(
                "[data-audio-toggle]"
            );

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    toggleMute
                );
            }
        );

        updateMuteButton();
    }


    /* =====================================================
       SET LANGUAGE
    ===================================================== */

    function setLanguage(
        language
    ) {

        if (
            language !== "ar" &&
            language !== "en"
        ) {

            return;
        }

        CONFIG.language =
            language;
    }


    /* =====================================================
       SET VOLUME
    ===================================================== */

    function setVolume(
        value
    ) {

        const volume =
            Number(value);

        if (
            Number.isNaN(volume)
        ) {

            return;
        }

        CONFIG.soundVolume =
            Math.max(
                0,
                Math.min(
                    1,
                    volume
                )
            );

        CONFIG.speechVolume =
            Math.max(
                0,
                Math.min(
                    1,
                    volume
                )
            );
    }


    /* =====================================================
       ENABLE / DISABLE
    ===================================================== */

    function setEnabled(
        value
    ) {

        CONFIG.enabled =
            Boolean(value);

        CONFIG.soundEnabled =
            CONFIG.enabled;

        CONFIG.voiceEnabled =
            CONFIG.enabled;

        if (
            !CONFIG.enabled &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        init,

        speak,

        success,

        errorSound,

        damageAlert,

        speakDamage,

        announceDetections,

        inspectionSummary,

        playTone,

        toggleMute,

        setMuted,

        setLanguage,

        setVolume,

        setEnabled,

        isMuted: () =>
            state.muted,

        isEnabled: () =>
            CONFIG.enabled

    };


    return api;

})();


/* =========================================================
   INITIALIZE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            AutoInspectSpeech.init()
    );

} else {

    AutoInspectSpeech.init();

}


/* =========================================================
   GLOBAL
========================================================= */

window.AutoInspectSpeech =
    AutoInspectSpeech;
