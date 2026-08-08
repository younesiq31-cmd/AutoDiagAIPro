/* =========================================================
   AutoInspect AI
   ai-engine.js
   Vehicle Body Inspection Engine
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectAIEngine = (() => {

    const CONFIG = {
        maxImages: 12,

        damageTypes: {
            scratch: {
                id: "scratch",
                ar: "خدش",
                en: "Scratch",
                severity: "medium"
            },

            dent: {
                id: "dent",
                ar: "انبعاج",
                en: "Dent",
                severity: "high"
            },

            crack: {
                id: "crack",
                ar: "كسر / تشقق",
                en: "Crack",
                severity: "high"
            },

            rust: {
                id: "rust",
                ar: "صدأ",
                en: "Rust",
                severity: "medium"
            },

            paint: {
                id: "paint",
                ar: "اختلاف في الطلاء",
                en: "Paint Difference",
                severity: "medium"
            }
        },

        bodyParts: [
            "front_bumper",
            "hood",
            "left_fender",
            "right_fender",
            "left_front_door",
            "right_front_door",
            "left_rear_door",
            "right_rear_door",
            "roof",
            "trunk",
            "rear_bumper",
            "left_mirror",
            "right_mirror",
            "windshield",
            "rear_glass"
        ]
    };


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    const state = {

        model: null,

        modelLoaded: false,

        modelType: null,

        results: [],

        running: false,

        audioContext: null,

        lastAlert: 0

    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        window.AutoInspectAI.engine = api;

        console.log(
            "AutoInspect AI Engine initialized."
        );

    }


    /* =====================================================
       LOAD REAL AI MODEL
       ===================================================== */

    async function loadModel(modelUrl) {

        if (!modelUrl) {

            console.warn(
                "No AI model URL supplied."
            );

            return false;
        }


        /*
         * نقطة الربط المستقبلية:
         *
         * ONNX Runtime Web
         * TensorFlow.js
         * WebAssembly
         *
         * مثال:
         *
         * state.model =
         * await ort.InferenceSession.create(modelUrl);
         *
         */


        try {

            state.modelLoaded = false;

            state.model = null;

            console.log(
                "AI model endpoint prepared:",
                modelUrl
            );

            return false;

        } catch (error) {

            console.error(
                "AI model loading error:",
                error
            );

            return false;
        }

    }


    /* =====================================================
       IMAGE PREPROCESSING
    ===================================================== */

    async function prepareImage(file) {

        if (!file) {

            throw new Error(
                "Image file is missing."
            );

        }


        if (!file.type.startsWith("image/")) {

            throw new Error(
                "Unsupported image type."
            );

        }


        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    const image =
                        new Image();

                    image.onload = () => {

                        resolve({
                            image,
                            width: image.width,
                            height: image.height,
                            source: reader.result
                        });

                    };

                    image.onerror =
                        reject;

                    image.src =
                        reader.result;

                };

                reader.onerror =
                    reject;

                reader.readAsDataURL(file);

            }
        );

    }


    /* =====================================================
       DEMO VISUAL ANALYSIS
       ===================================================== */

    function analyzeImageDemo(imageInfo, index) {

        /*
         * IMPORTANT:
         *
         * This is NOT a real AI diagnosis.
         *
         * It creates a safe demo result so the
         * platform UI can be tested before connecting
         * a validated computer-vision model.
         */


        const seed =
            (
                imageInfo.width +
                imageInfo.height +
                index * 31
            ) % 100;


        const detected = [];


        /*
         * Demo only:
         * low probability so the user doesn't
         * receive false alarms constantly.
         */

        if (seed % 17 === 0) {

            detected.push(
                createDetection(
                    "scratch",
                    index
                )
            );

        }


        if (seed % 29 === 0) {

            detected.push(
                createDetection(
                    "dent",
                    index
                )
            );

        }


        return {

            imageIndex: index,

            width: imageInfo.width,

            height: imageInfo.height,

            detections: detected,

            analyzedAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       CREATE DETECTION
    ===================================================== */

    function createDetection(type, imageIndex) {

        const definitions =
            CONFIG.damageTypes[type];


        /*
         * Demo bounding box.
         *
         * A real AI model must provide
         * coordinates from its inference.
         */

        const x =
            0.20 + Math.random() * 0.45;

        const y =
            0.20 + Math.random() * 0.40;

        const width =
            0.10 + Math.random() * 0.20;

        const height =
            0.08 + Math.random() * 0.18;


        const confidence =
            Math.round(
                (0.70 + Math.random() * 0.25) * 100
            );


        return {

            type: definitions.id,

            labelAr: definitions.ar,

            labelEn: definitions.en,

            severity: definitions.severity,

            confidence,

            imageIndex,

            box: {

                x,

                y,

                width,

                height

            }

        };

    }


    /* =====================================================
       REAL MODEL RESULT NORMALIZATION
       ===================================================== */

    function normalizeModelResults(rawResults) {

        if (!Array.isArray(rawResults)) {

            return [];

        }


        return rawResults
            .filter(item => item)
            .map(item => {

                const type =
                    item.type ||
                    item.class ||
                    "unknown";


                const definition =
                    CONFIG.damageTypes[type] ||
                    {

                        id: type,

                        ar: type,

                        en: type,

                        severity: "medium"

                    };


                return {

                    type: definition.id,

                    labelAr: definition.ar,

                    labelEn: definition.en,

                    severity:
                        item.severity ||
                        definition.severity,

                    confidence:
                        Math.round(
                            Number(
                                item.confidence || 0
                            ) * 100
                        ),

                    imageIndex:
                        item.imageIndex || 0,

                    box:
                        item.box || null

                };

            });

    }


    /* =====================================================
       ANALYZE FILE
    ===================================================== */

    async function analyzeFile(file, index) {

        const image =
            await prepareImage(file);


        /*
         * Real AI model:
         *
         * If modelLoaded === true,
         * call the model here.
         */

        if (
            state.modelLoaded &&
            state.model
        ) {

            /*
             * TODO:
             *
             * const raw =
             * await runModel(
             *     state.model,
             *     image
             * );
             *
             * return normalizeModelResults(raw);
             */

        }


        return analyzeImageDemo(
            image,
            index
        );

    }


    /* =====================================================
       RUN INSPECTION
    ===================================================== */

    async function inspect(files) {

        if (state.running) {

            return {
                success: false,
                message:
                    "الفحص قيد التشغيل."
            };

        }


        if (!files || !files.length) {

            return {

                success: false,

                message:
                    "لم يتم اختيار صور."

            };

        }


        state.running = true;

        state.results = [];


        try {

            const limited =
                [...files].slice(
                    0,
                    CONFIG.maxImages
                );


            for (
                let index = 0;
                index < limited.length;
                index++
            ) {

                const result =
                    await analyzeFile(
                        limited[index],
                        index
                    );


                state.results.push(
                    result
                );

            }


            const summary =
                buildSummary(
                    state.results
                );


            renderResults(
                state.results,
                summary
            );


            return {

                success: true,

                results:
                    state.results,

                summary

            };

        } catch (error) {

            console.error(
                "Inspection error:",
                error
            );


            return {

                success: false,

                message:
                    "حدث خطأ أثناء تحليل الصور."

            };

        } finally {

            state.running = false;

        }

    }


    /* =====================================================
       BUILD SUMMARY
    ===================================================== */

    function buildSummary(results) {

        const detections =
            results.flatMap(
                result =>
                    result.detections || []
            );


        const counts = {

            scratch: 0,

            dent: 0,

            crack: 0,

            rust: 0,

            paint: 0

        };


        detections.forEach(
            detection => {

                if (
                    Object.prototype.hasOwnProperty
                        .call(
                            counts,
                            detection.type
                        )
                ) {

                    counts[
                        detection.type
                    ]++;

                }

            }
        );


        let damageScore = 0;


        detections.forEach(
            detection => {

                const weight = {

                    scratch: 12,

                    dent: 22,

                    crack: 28,

                    rust: 14,

                    paint: 10

                }[detection.type] || 10;


                damageScore +=
                    weight *
                    (
                        detection.confidence /
                        100
                    );

            }
        );


        damageScore =
            Math.min(
                100,
                Math.round(damageScore)
            );


        const health =
            Math.max(
                0,
                100 - damageScore
            );


        const confidence =
            detections.length
                ? Math.round(
                    detections.reduce(
                        (sum, item) =>
                            sum +
                            item.confidence,
                        0
                    ) /
                    detections.length
                )
                : 0;


        return {

            totalImages:
                results.length,

            totalDetections:
                detections.length,

            counts,

            damageScore,

            health,

            confidence,

            severity:
                getOverallSeverity(
                    detections
                )

        };

    }


    /* =====================================================
       OVERALL SEVERITY
    ===================================================== */

    function getOverallSeverity(
        detections
    ) {

        if (!detections.length) {

            return "none";

        }


        if (
            detections.some(
                d =>
                    d.type === "crack" ||
                    d.type === "dent"
            )
        ) {

            return "high";

        }


        if (
            detections.some(
                d =>
                    d.type === "scratch" ||
                    d.type === "rust" ||
                    d.type === "paint"
            )
        ) {

            return "medium";

        }


        return "low";

    }


    /* =====================================================
       RENDER RESULTS
    ===================================================== */

    function renderResults(
        results,
        summary
    ) {

        updateScore(
            "#health",
            summary.health
        );


        updateScore(
            "#damage",
            summary.damageScore
        );


        updateScore(
            "#confidence",
            summary.confidence
        );


        /*
         * Also support alternate score elements.
         */

        updateScore(
            "#healthScore",
            summary.health
        );


        updateScore(
            "#damageScore",
            summary.damageScore
        );


        updateScore(
            "#confidenceScore",
            summary.confidence
        );


        /*
         * Update damage canvas.
         */

        renderDamageMap(
            results
        );


        /*
         * Generate speech alerts.
         */

        if (
            summary.totalDetections >
            0
        ) {

            announceDetections(
                results
            );

        }

    }


    /* =====================================================
       UPDATE SCORE
    ===================================================== */

    function updateScore(
        selector,
        value
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (!element) {

            return;

        }


        element.textContent =
            `${value}`;

    }


    /* =====================================================
       DAMAGE MAP
    ===================================================== */

    function renderDamageMap(results) {

        const canvas =
            document.querySelector(
                "#damageCanvas"
            );


        const carImage =
            document.querySelector(
                "#carMap"
            );


        if (!canvas || !carImage) {

            return;

        }


        const rect =
            carImage.getBoundingClientRect();


        const parent =
            canvas.parentElement
                .getBoundingClientRect();


        canvas.width =
            Math.max(
                1,
                Math.round(
                    rect.width
                )
            );


        canvas.height =
            Math.max(
                1,
                Math.round(
                    rect.height
                )
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (!ctx) {

            return;

        }


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        const detections =
            results.flatMap(
                result =>
                    result.detections || []
            );


        detections.forEach(
            detection => {

                if (!detection.box) {

                    return;

                }


                const box =
                    detection.box;


                const x =
                    box.x *
                    canvas.width;


                const y =
                    box.y *
                    canvas.height;


                const width =
                    box.width *
                    canvas.width;


                const height =
                    box.height *
                    canvas.height;


                ctx.save();


                ctx.strokeStyle =
                    "#ff3b30";


                ctx.fillStyle =
                    "rgba(255,59,48,.20)";


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.roundRect(
                    x,
                    y,
                    width,
                    height,
                    8
                );


                ctx.fill();


                ctx.stroke();


                ctx.font =
                    "bold 16px Cairo, sans-serif";


                ctx.fillStyle =
                    "#ff3b30";


                ctx.fillText(
                    detection.labelAr,
                    x,
                    Math.max(
                        20,
                        y - 8
                    )
                );


                ctx.restore();

            }
        );

    }


    /* =====================================================
       AUDIO WARNING
    ===================================================== */

    function getAudioContext() {

        if (!state.audioContext) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContext) {

                return null;

            }


            state.audioContext =
                new AudioContext();

        }


        return state.audioContext;

    }


    function playTone(
        frequency,
        duration,
        type = "sine"
    ) {

        const context =
            getAudioContext();


        if (!context) {

            return;

        }


        if (
            context.state ===
            "suspended"
        ) {

            context.resume();

        }


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.22,
            context.currentTime +
            0.02
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
            0.03
        );

    }


    function playWarningSound(
        severity = "medium"
    ) {

        const now =
            Date.now();


        /*
         * Avoid repeating alerts too quickly.
         */

        if (
            now -
            state.lastAlert <
            900
        ) {

            return;

        }


        state.lastAlert =
            now;


        if (
            severity ===
            "high"
        ) {

            playTone(
                880,
                0.18
            );


            setTimeout(
                () =>
                    playTone(
                        660,
                        0.22
                    ),
                220
            );


        } else {

            playTone(
                660,
                0.18
            );

        }

    }


    /* =====================================================
       SPEECH WARNING
    ===================================================== */

    function speak(
        text
    ) {

        if (
            !("speechSynthesis"
                in window)
        ) {

            return;

        }


        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            "ar-SA";


        utterance.rate =
            0.95;


        utterance.pitch =
            1;


        utterance.volume =
            1;


        window.speechSynthesis.speak(
            utterance
        );

    }


    /* =====================================================
       ANNOUNCE DETECTIONS
    ===================================================== */

    function announceDetections(
        results
    ) {

        const detections =
            results.flatMap(
                result =>
                    result.detections || []
            );


        if (!detections.length) {

            return;

        }


        const unique =
            [
                ...new Map(
                    detections.map(
                        item =>
                            [
                                item.type,
                                item
                            ]
                    )
                ).values()
            ];


        unique.forEach(
            (detection, index) => {

                setTimeout(
                    () => {

                        playWarningSound(
                            detection.severity
                        );


                        speak(
                            `تحذير. تم اكتشاف ${detection.labelAr}`
                        );

                    },
                    index * 1200
                );

            }
        );

    }


    /* =====================================================
       MANUAL ALERT
    ===================================================== */

    function manualWarning(
        type,
        confidence = 90
    ) {

        const definition =
            CONFIG.damageTypes[type];


        if (!definition) {

            return;

        }


        playWarningSound(
            definition.severity
        );


        speak(
            `تحذير. تم اكتشاف ${definition.ar}. نسبة الثقة ${confidence} بالمئة`
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        init,

        loadModel,

        inspect,

        analyzeFile,

        renderDamageMap,

        playWarningSound,

        manualWarning,

        getResults: () =>
            state.results,

        getSummary: () =>
            buildSummary(
                state.results
            ),

        isModelLoaded: () =>
            state.modelLoaded

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
            AutoInspectAIEngine.init()
    );

} else {

    AutoInspectAIEngine.init();

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.AutoInspectAIEngine =
    AutoInspectAIEngine;
