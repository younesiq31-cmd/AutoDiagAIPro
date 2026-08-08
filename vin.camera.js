/* =========================================================
   AutoInspect AI
   vin-scanner.js
   VIN OCR + Validation + Camera Capture
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectVIN = (() => {

    const CONFIG = {
        length: 17,

        /*
         * الأحرف غير المستخدمة في VIN:
         * I / O / Q
         */
        forbidden: /[IOQ]/g,

        allowed: /^[A-HJ-NPR-Z0-9]{17}$/i
    };

    const state = {
        scanning: false,
        lastVIN: "",
        stream: null
    };

    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        window.AutoInspectAI.vinScanner = api;

        bindButtons();

        console.log(
            "AutoInspect AI VIN Scanner initialized."
        );
    }

    /* =====================================================
       BUTTONS
    ===================================================== */

    function bindButtons() {

        const scanButton =
            document.querySelector(
                "#scanVIN"
            );

        if (scanButton) {

            scanButton.addEventListener(
                "click",
                startScan
            );
        }

    }

    /* =====================================================
       NORMALIZE VIN
    ===================================================== */

    function normalizeVIN(value) {

        return String(value || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .replace(CONFIG.forbidden, "")
            .slice(0, CONFIG.length);
    }

    /* =====================================================
       VALIDATE VIN
    ===================================================== */

    function validateVIN(value) {

        const vin =
            normalizeVIN(value);

        if (
            vin.length !==
            CONFIG.length
        ) {

            return {
                valid: false,
                vin,
                message:
                    "VIN يجب أن يتكون من 17 خانة."
            };
        }

        if (
            !CONFIG.allowed.test(vin)
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
       PUT VIN INTO FORM
    ===================================================== */

    function setVIN(value) {

        const result =
            validateVIN(value);

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
                        bubbles: true
                    }
                )
            );
        }

        state.lastVIN =
            result.vin;

        showStatus(
            result.message,
            result.valid
        );

        return result;
    }

    /* =====================================================
       START SCAN
    ===================================================== */

    async function startScan() {

        if (state.scanning) {
            return;
        }

        state.scanning = true;

        try {

            showStatus(
                "جاري تشغيل قارئ VIN...",
                true
            );

            await openScannerModal();

        } catch (error) {

            console.error(
                "VIN scanner error:",
                error
            );

            showStatus(
                "تعذر تشغيل قارئ VIN.",
                false
            );

        } finally {

            state.scanning = false;
        }
    }

    /* =====================================================
       OPEN CAMERA
    ===================================================== */

    async function openScannerModal() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            /*
             * fallback:
             * افتح اختيار صورة.
             */

            openImageFallback();

            return;
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

        createScannerModal();
    }

    /* =====================================================
       SCANNER MODAL
    ===================================================== */

    function createScannerModal() {

        closeScannerModal();

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "vinScannerModal";

        Object.assign(
            modal.style,
            {
                position: "fixed",
                inset: "0",
                zIndex: "20000",
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
                    "min(900px,96vw)",
                background:
                    "#071426",
                borderRadius:
                    "22px",
                padding:
                    "20px",
                textAlign:
                    "center"
            }
        );

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "قراءة VIN بالكاميرا";

        title.style.color =
            "#20E3B2";

        const instruction =
            document.createElement(
                "p"
            );

        instruction.textContent =
            "ضع منطقة VIN داخل الإطار ثم اضغط التقاط.";

        instruction.style.color =
            "#aab6c5";

        const video =
            document.createElement(
                "video"
            );

        video.id =
            "vinScannerVideo";

        video.autoplay =
            true;

        video.playsInline =
            true;

        video.muted =
            true;

        Object.assign(
            video.style,
            {
                width: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
                borderRadius: "16px",
                marginTop: "15px"
            }
        );

        video.srcObject =
            state.stream;

        const guide =
            document.createElement(
                "div"
            );

        Object.assign(
            guide.style,
            {
                position:
                    "absolute",
                left:
                    "50%",
                top:
                    "50%",
                transform:
                    "translate(-50%,-50%)",
                width:
                    "75%",
                height:
                    "90px",
                border:
                    "3px solid #20E3B2",
                borderRadius:
                    "12px",
                pointerEvents:
                    "none"
            }
        );

        const cameraArea =
            document.createElement(
                "div"
            );

        Object.assign(
            cameraArea.style,
            {
                position:
                    "relative"
            }
        );

        cameraArea.appendChild(
            video
        );

        cameraArea.appendChild(
            guide
        );

        const controls =
            document.createElement(
                "div"
            );

        Object.assign(
            controls.style,
            {
                display:
                    "flex",
                gap:
                    "10px",
                justifyContent:
                    "center",
                flexWrap:
                    "wrap",
                marginTop:
                    "18px"
            }
        );

        const capture =
            document.createElement(
                "button"
            );

        capture.textContent =
            "📷 التقاط VIN";

        capture.addEventListener(
            "click",
            () =>
                captureVINFrame(
                    video
                )
        );

        const upload =
            document.createElement(
                "button"
            );

        upload.textContent =
            "🖼️ رفع صورة VIN";

        upload.addEventListener(
            "click",
            openImageFallback
        );

        const close =
            document.createElement(
                "button"
            );

        close.textContent =
            "إغلاق";

        close.addEventListener(
            "click",
            closeScannerModal
        );

        controls.appendChild(
            capture
        );

        controls.appendChild(
            upload
        );

        controls.appendChild(
            close
        );

        panel.appendChild(
            title
        );

        panel.appendChild(
            instruction
        );

        panel.appendChild(
            cameraArea
        );

        panel.appendChild(
            controls
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
       CAPTURE FRAME
    ===================================================== */

    function captureVINFrame(video) {

        if (
            !video ||
            !video.videoWidth
        ) {

            showStatus(
                "الكاميرا غير جاهزة.",
                false
            );

            return;
        }

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const ctx =
            canvas.getContext(
                "2d"
            );

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            blob => {

                if (!blob) {

                    showStatus(
                        "تعذر التقاط الصورة.",
                        false
                    );

                    return;
                }

                const file =
                    new File(
                        [blob],
                        "vin-camera.jpg",
                        {
                            type:
                                "image/jpeg"
                        }
                    );

                processImage(
                    file
                );

            },
            "image/jpeg",
            .92
        );
    }

    /* =====================================================
       IMAGE FALLBACK
    ===================================================== */

    function openImageFallback() {

        const input =
            document.createElement(
                "input"
            );

        input.type =
            "file";

        input.accept =
            "image/*";

        input.capture =
            "environment";

        input.addEventListener(
            "change",
            () => {

                const file =
                    input.files &&
                    input.files[0];

                if (file) {

                    processImage(
                        file
                    );
                }
            }
        );

        input.click();
    }

    /* =====================================================
       OCR PROCESS
    ===================================================== */

    async function processImage(file) {

        closeScannerModal();

        showStatus(
            "جاري قراءة VIN من الصورة...",
            true
        );

        /*
         * إذا كانت Tesseract.js محملة في الصفحة،
         * يمكن استخدامها هنا.
         */

        if (
            window.Tesseract &&
            typeof
                window.Tesseract.recognize ===
                "function"
        ) {

            try {

                const result =
                    await window.Tesseract.recognize(
                        file,
                        "eng",
                        {
                            logger:
                                message => {

                                    if (
                                        message &&
                                        typeof
                                            message.progress ===
                                            "number"
                                    ) {

                                        const percent =
                                            Math.round(
                                                message.progress *
                                                100
                                            );

                                        showStatus(
                                            `جاري تحليل VIN: ${percent}%`,
                                            true
                                        );
                                    }
                                }
                        }
                    );

                const text =
                    result?.data?.text ||
                    "";

                const vin =
                    extractVIN(
                        text
                    );

                if (vin) {

                    const validation =
                        setVIN(
                            vin
                        );

                    if (
                        validation.valid
                    ) {

                        showStatus(
                            `تمت قراءة VIN: ${vin}`,
                            true
                        );

                        announceSuccess();

                        return validation;
                    }
                }

                showStatus(
                    "لم يتم العثور على VIN صالح. حاول تصوير الرقم بشكل أوضح.",
                    false
                );

                return null;

            } catch (error) {

                console.error(
                    "OCR error:",
                    error
                );

                showStatus(
                    "حدث خطأ أثناء OCR.",
                    false
                );

                return null;
            }
        }

        /*
         * إذا لم يتم تحميل OCR:
         * لا ندعي أن القراءة تمت.
         */

        showStatus(
            "محرك OCR غير مضاف بعد. أضف Tesseract.js لقراءة VIN من الصور.",
            false
        );

        return null;
    }

    /* =====================================================
       EXTRACT VIN
    ===================================================== */

    function extractVIN(text) {

        if (!text) {
            return null;
        }

        const normalized =
            String(text)
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");

        /*
         * ابحث عن مقطع 17 خانة
         * لا يحتوي I/O/Q.
         */

        const matches =
            normalized.match(
                /[A-HJ-NPR-Z0-9]{17}/g
            );

        if (!matches) {
            return null;
        }

        for (const candidate of matches) {

            const validation =
                validateVIN(
                    candidate
                );

            if (
                validation.valid
            ) {

                return validation.vin;
            }
        }

        return null;
    }

    /* =====================================================
       STATUS
    ===================================================== */

    function showStatus(
        message,
        success
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

            status.dataset.state =
                success
                    ? "success"
                    : "error";
        }

        if (
            window.AutoInspectUI &&
            typeof
                window.AutoInspectUI.toast ===
                "function"
        ) {

            window.AutoInspectUI.toast(
                message,
                success
            );
        }
    }

    /* =====================================================
       SUCCESS SOUND / SPEECH
    ===================================================== */

    function announceSuccess() {

        if (
            window.AutoInspectAIEngine &&
            typeof
                window.AutoInspectAIEngine
                    .playWarningSound ===
                "function"
        ) {

            /*
             * نغمة نجاح بسيطة.
             * لا تستخدم كتحذير ضرر.
             */
        }

        if (
            "speechSynthesis" in
            window
        ) {

            const speech =
                new SpeechSynthesisUtterance(
                    "تمت قراءة رقم المركبة بنجاح"
                );

            speech.lang =
                "ar-SA";

            window.speechSynthesis.speak(
                speech
            );
        }
    }

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeScannerModal() {

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

        const modal =
            document.querySelector(
                "#vinScannerModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

        init,

        startScan,

        normalizeVIN,

        validateVIN,

        setVIN,

        extractVIN,

        processImage,

        closeScannerModal,

        getVIN: () =>
            state.lastVIN,

        isScanning: () =>
            state.scanning
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
            AutoInspectVIN.init()
    );

} else {

    AutoInspectVIN.init();

}


/* =========================================================
   GLOBAL
========================================================= */

window.AutoInspectVIN =
    AutoInspectVIN;
