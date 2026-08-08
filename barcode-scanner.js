/* =========================================================
   AutoInspect AI
   barcode-scanner.js
   QR / Barcode Scanner
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectBarcode = (() => {

    const state = {
        scanning: false,
        stream: null,
        detector: null,
        animationFrame: null
    };

    const CONFIG = {
        scanInterval: 120,
        formats: [
            "qr_code",
            "code_128",
            "code_39",
            "code_93",
            "codabar",
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "itf"
        ]
    };

    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        window.AutoInspectAI.barcodeScanner =
            api;

        const button =
            document.querySelector(
                "#scanBarcode"
            );

        if (button) {

            button.addEventListener(
                "click",
                start
            );
        }

        console.log(
            "AutoInspect AI Barcode Scanner initialized."
        );
    }

    /* =====================================================
       START
    ===================================================== */

    async function start() {

        if (state.scanning) {
            return;
        }

        if (
            !("BarcodeDetector" in window)
        ) {

            showMessage(
                "هذا المتصفح لا يدعم BarcodeDetector. سنحتاج إلى إضافة محرك Barcode/QR بديل."
            );

            return;
        }

        try {

            state.scanning = true;

            state.detector =
                new BarcodeDetector({
                    formats:
                        CONFIG.formats
                });

            await openCamera();

            createModal();

            beginDetection();

        } catch (error) {

            console.error(
                "Barcode scanner error:",
                error
            );

            showMessage(
                "تعذر تشغيل قارئ QR / Barcode."
            );

            stop();
        }
    }

    /* =====================================================
       CAMERA
    ===================================================== */

    async function openCamera() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera API unavailable."
            );
        }

        state.stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode: {
                            ideal:
                                "environment"
                        },

                        width: {
                            ideal: 1920
                        },

                        height: {
                            ideal: 1080
                        }
                    },

                    audio: false

                });
    }

    /* =====================================================
       MODAL
    ===================================================== */

    function createModal() {

        closeModal();

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "barcodeScannerModal";

        Object.assign(
            modal.style,
            {
                position: "fixed",
                inset: "0",
                zIndex: "21000",
                background:
                    "rgba(0,0,0,.96)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }
        );

        const panel =
            document.createElement(
                "div"
            );

        Object.assign(
            panel.style,
            {
                width:
                    "min(850px,96vw)",
                background:
                    "#071426",
                padding:
                    "20px",
                borderRadius:
                    "22px",
                textAlign:
                    "center"
            }
        );

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "QR / Barcode";

        title.style.color =
            "#20E3B2";

        const description =
            document.createElement(
                "p"
            );

        description.textContent =
            "وجّه الكاميرا إلى رمز VIN أو Barcode.";

        description.style.color =
            "#aab6c5";

        const camera =
            document.createElement(
                "div"
            );

        Object.assign(
            camera.style,
            {
                position:
                    "relative",
                marginTop:
                    "15px"
            }
        );

        const video =
            document.createElement(
                "video"
            );

        video.id =
            "barcodeScannerVideo";

        video.autoplay =
            true;

        video.playsInline =
            true;

        video.muted =
            true;

        video.srcObject =
            state.stream;

        Object.assign(
            video.style,
            {
                width:
                    "100%",
                maxHeight:
                    "65vh",
                objectFit:
                    "contain",
                borderRadius:
                    "16px"
            }
        );

        const frame =
            document.createElement(
                "div"
            );

        Object.assign(
            frame.style,
            {
                position:
                    "absolute",
                top:
                    "50%",
                left:
                    "50%",
                transform:
                    "translate(-50%,-50%)",
                width:
                    "75%",
                height:
                    "120px",
                border:
                    "3px solid #20E3B2",
                borderRadius:
                    "14px",
                pointerEvents:
                    "none",
                boxShadow:
                    "0 0 30px rgba(32,227,178,.35)"
            }
        );

        camera.appendChild(
            video
        );

        camera.appendChild(
            frame
        );

        const close =
            document.createElement(
                "button"
            );

        close.textContent =
            "إغلاق";

        close.style.marginTop =
            "15px";

        close.addEventListener(
            "click",
            stop
        );

        panel.appendChild(
            title
        );

        panel.appendChild(
            description
        );

        panel.appendChild(
            camera
        );

        panel.appendChild(
            close
        );

        modal.appendChild(
            panel
        );

        document.body.appendChild(
            modal
        );

        video.play().catch(
            () => {}
        );
    }

    /* =====================================================
       DETECTION LOOP
    ===================================================== */

    function beginDetection() {

        const video =
            document.querySelector(
                "#barcodeScannerVideo"
            );

        if (!video) {
            return;
        }

        let lastScan =
            0;

        const loop =
            async timestamp => {

                if (
                    !state.scanning
                ) {

                    return;
                }

                if (
                    timestamp -
                    lastScan >=
                    CONFIG.scanInterval
                ) {

                    lastScan =
                        timestamp;

                    await detect(
                        video
                    );
                }

                state.animationFrame =
                    requestAnimationFrame(
                        loop
                    );
            };

        state.animationFrame =
            requestAnimationFrame(
                loop
            );
    }

    /* =====================================================
       DETECT
    ===================================================== */

    async function detect(video) {

        if (
            !state.detector ||
            !video ||
            video.readyState <
                HTMLMediaElement.HAVE_ENOUGH_DATA
        ) {

            return;
        }

        try {

            const codes =
                await state.detector
                    .detect(video);

            if (
                !codes ||
                !codes.length
            ) {

                return;
            }

            for (
                const code of codes
            ) {

                const value =
                    cleanValue(
                        code.rawValue
                    );

                if (!value) {
                    continue;
                }

                processValue(
                    value
                );

                break;
            }

        } catch (error) {

            /*
             * لا نوقف الكاميرا بسبب
             * خطأ قراءة إطار واحد.
             */

            console.debug(
                "Barcode frame skipped.",
                error
            );
        }
    }

    /* =====================================================
       PROCESS VALUE
    ===================================================== */

    function processValue(value) {

        const clean =
            cleanValue(
                value
            );

        /*
         * محاولة التعرف على VIN.
         */

        const vin =
            extractVIN(
                clean
            );

        if (vin) {

            const result =
                validateVIN(
                    vin
                );

            if (
                result.valid
            ) {

                setVIN(
                    result.vin
                );

                successFeedback();

                showMessage(
                    `تمت قراءة VIN: ${result.vin}`
                );

                setTimeout(
                    stop,
                    800
                );

                return;
            }
        }

        /*
         * إذا لم يكن VIN،
         * نضع القيمة الخام في خانة
         * مخصصة للباركود إن وجدت.
         */

        const barcodeInput =
            document.querySelector(
                "#barcodeValue"
            );

        if (barcodeInput) {

            barcodeInput.value =
                clean;
        }

        showMessage(
            `تمت قراءة الرمز: ${clean}`
        );

        successFeedback();

        setTimeout(
            stop,
            800
        );
    }

    /* =====================================================
       CLEAN VALUE
    ===================================================== */

    function cleanValue(value) {

        return String(
            value || ""
        )
            .trim()
            .toUpperCase()
            .replace(
                /\s+/g,
                ""
            );
    }

    /* =====================================================
       EXTRACT VIN
    ===================================================== */

    function extractVIN(value) {

        const clean =
            cleanValue(
                value
            );

        /*
         * VIN قياسي:
         * 17 حرف/رقم
         * بدون I O Q
         */

        const exact =
            clean.match(
                /^[A-HJ-NPR-Z0-9]{17}$/
            );

        if (exact) {

            return exact[0];
        }

        /*
         * بعض الرموز قد تحتوي نصًا
         * إضافيًا حول VIN.
         */

        const found =
            clean.match(
                /[A-HJ-NPR-Z0-9]{17}/
            );

        return found
            ? found[0]
            : null;
    }

    /* =====================================================
       VALIDATE VIN
    ===================================================== */

    function validateVIN(value) {

        const vin =
            cleanValue(
                value
            );

        if (
            vin.length !== 17
        ) {

            return {
                valid: false,
                vin,
                message:
                    "VIN يجب أن يحتوي على 17 خانة."
            };
        }

        if (
            /[IOQ]/.test(vin)
        ) {

            return {
                valid: false,
                vin,
                message:
                    "VIN يحتوي على حرف غير مسموح."
            };
        }

        if (
            !/^[A-HJ-NPR-Z0-9]{17}$/
                .test(vin)
        ) {

            return {
                valid: false,
                vin,
                message:
                    "صيغة VIN غير صحيحة."
            };
        }

        return {
            valid: true,
            vin,
            message:
                "VIN صالح مبدئيًا."
        };
    }

    /* =====================================================
       SET VIN
    ===================================================== */

    function setVIN(value) {

        const result =
            validateVIN(
                value
            );

        const input =
            document.querySelector(
                "#vin"
            );

        if (input) {

            input.value =
                result.vin;

            input.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:
                            true
                    }
                )
            );
        }

        if (
            window.AutoInspectAI &&
            window.AutoInspectAI.vinScanner &&
            typeof
                window.AutoInspectAI
                    .vinScanner
                    .setVIN ===
                "function"
        ) {

            /*
             * استخدم واجهة VIN Scanner
             * إذا كانت متاحة.
             */

            window.AutoInspectAI
                .vinScanner
                .setVIN(
                    result.vin
                );
        }

        return result;
    }

    /* =====================================================
       SUCCESS FEEDBACK
    ===================================================== */

    function successFeedback() {

        /*
         * صوت قصير باستخدام Web Audio.
         */

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const context =
                new AudioContext();

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.value =
                880;

            gain.gain.setValueAtTime(
                0.001,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.18,
                context.currentTime +
                0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime +
                0.25
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
                0.28
            );

        } catch (error) {

            console.debug(
                "Audio feedback unavailable."
            );
        }


        /*
         * نطق النجاح.
         */

        if (
            "speechSynthesis" in
            window
        ) {

            const utterance =
                new SpeechSynthesisUtterance(
                    "تمت قراءة الرمز بنجاح"
                );

            utterance.lang =
                "ar-SA";

            window.speechSynthesis.speak(
                utterance
            );
        }
    }

    /* =====================================================
       STOP
    ===================================================== */

    function stop() {

        state.scanning =
            false;

        if (
            state.animationFrame
        ) {

            cancelAnimationFrame(
                state.animationFrame
            );

            state.animationFrame =
                null;
        }

        if (state.stream) {

            state.stream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            state.stream =
                null;
        }

        closeModal();
    }

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        const modal =
            document.querySelector(
                "#barcodeScannerModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        message
    ) {

        const status =
            document.querySelector(
                "#inspectionStatus"
            ) ||
            document.querySelector(
                "#systemStatus"
            );

        if (status) {

            status.textContent =
                message;
        }

        if (
            window.AutoInspectUI &&
            typeof
                window.AutoInspectUI.toast ===
                "function"
        ) {

            window.AutoInspectUI.toast(
                message
            );

            return;
        }

        const existing =
            document.querySelector(
                "#autoInspectBarcodeToast"
            );

        if (existing) {
            existing.remove();
        }

        const toast =
            document.createElement(
                "div"
            );

        toast.id =
            "autoInspectBarcodeToast";

        toast.textContent =
            message;

        Object.assign(
            toast.style,
            {
                position:
                    "fixed",
                bottom:
                    "25px",
                left:
                    "50%",
                transform:
                    "translateX(-50%)",
                zIndex:
                    "30000",
                background:
                    "#10243d",
                color:
                    "#fff",
                padding:
                    "14px 20px",
                borderRadius:
                    "14px",
                boxShadow:
                    "0 12px 35px rgba(0,0,0,.4)"
            }
        );

        document.body.appendChild(
            toast
        );

        setTimeout(
            () => toast.remove(),
            3500
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        init,

        start,

        stop,

        extractVIN,

        validateVIN,

        setVIN,

        getState: () => ({
            scanning:
                state.scanning
        })

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
            AutoInspectBarcode.init()
    );

} else {

    AutoInspectBarcode.init();

}


/* =========================================================
   GLOBAL
========================================================= */

window.AutoInspectBarcode =
    AutoInspectBarcode;
