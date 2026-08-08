/* =========================================================
   AutoInspect AI
   camera.js
   Camera + Gallery Manager
   ========================================================= */

"use strict";

window.AutoInspectAI = window.AutoInspectAI || {};

const AutoInspectCamera = (() => {

    const CONFIG = {
        maxImages: 12,
        imageQuality: 0.88,
        maxWidth: 1920,
        maxHeight: 1920
    };

    const state = {
        files: [],
        stream: null,
        cameraOpen: false
    };

    function init() {
        window.AutoInspectAI.camera = api;

        bindInputs();
        createCameraUI();

        console.log("AutoInspect AI Camera initialized.");
    }

    function bindInputs() {

        const gallery =
            document.querySelector("#galleryInput");

        const camera =
            document.querySelector("#cameraInput");

        if (gallery) {
            gallery.addEventListener(
                "change",
                event => {
                    addFiles(event.target.files);
                    event.target.value = "";
                }
            );
        }

        if (camera) {
            camera.addEventListener(
                "change",
                event => {
                    addFiles(event.target.files);
                    event.target.value = "";
                }
            );
        }
    }

    async function addFiles(fileList) {

        if (!fileList) return;

        const files =
            [...fileList].filter(
                file =>
                    file &&
                    file.type.startsWith("image/")
            );

        for (const file of files) {

            if (
                state.files.length >=
                CONFIG.maxImages
            ) {
                showMessage(
                    `الحد الأقصى ${CONFIG.maxImages} صورة.`
                );
                break;
            }

            const processed =
                await processImage(file);

            state.files.push(processed);
        }

        renderPreview();

        updateStatus();
    }

    async function processImage(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = event => {

                    const image =
                        new Image();

                    image.onload = () => {

                        const dimensions =
                            resizeDimensions(
                                image.width,
                                image.height
                            );

                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        canvas.width =
                            dimensions.width;

                        canvas.height =
                            dimensions.height;

                        const context =
                            canvas.getContext(
                                "2d"
                            );

                        context.drawImage(
                            image,
                            0,
                            0,
                            dimensions.width,
                            dimensions.height
                        );

                        canvas.toBlob(
                            blob => {

                                if (!blob) {
                                    reject(
                                        new Error(
                                            "تعذر معالجة الصورة."
                                        )
                                    );
                                    return;
                                }

                                resolve(
                                    new File(
                                        [blob],
                                        file.name,
                                        {
                                            type:
                                                "image/jpeg"
                                        }
                                    )
                                );

                            },
                            "image/jpeg",
                            CONFIG.imageQuality
                        );
                    };

                    image.onerror =
                        () =>
                            reject(
                                new Error(
                                    "تعذر قراءة الصورة."
                                )
                            );

                    image.src =
                        event.target.result;
                };

                reader.onerror =
                    () =>
                        reject(
                            new Error(
                                "تعذر تحميل الصورة."
                            )
                        );

                reader.readAsDataURL(file);
            }
        );
    }

    function resizeDimensions(
        width,
        height
    ) {

        let newWidth = width;
        let newHeight = height;

        const ratio =
            Math.min(
                CONFIG.maxWidth / width,
                CONFIG.maxHeight / height,
                1
            );

        newWidth =
            Math.round(width * ratio);

        newHeight =
            Math.round(height * ratio);

        return {
            width: newWidth,
            height: newHeight
        };
    }

    function renderPreview() {

        const container =
            document.querySelector(
                "#photoPreview"
            );

        if (!container) return;

        container.innerHTML = "";

        state.files.forEach(
            (file, index) => {

                const wrapper =
                    document.createElement(
                        "div"
                    );

                wrapper.className =
                    "autoinspect-photo";

                wrapper.style.position =
                    "relative";

                const image =
                    document.createElement(
                        "img"
                    );

                image.alt =
                    `Vehicle image ${index + 1}`;

                image.style.width =
                    "100%";

                image.style.height =
                    "180px";

                image.style.objectFit =
                    "cover";

                image.style.borderRadius =
                    "14px";

                const remove =
                    document.createElement(
                        "button"
                    );

                remove.type =
                    "button";

                remove.textContent =
                    "×";

                remove.title =
                    "حذف الصورة";

                remove.style.position =
                    "absolute";

                remove.style.top =
                    "8px";

                remove.style.right =
                    "8px";

                remove.style.width =
                    "36px";

                remove.style.height =
                    "36px";

                remove.style.padding =
                    "0";

                remove.style.borderRadius =
                    "50%";

                remove.style.background =
                    "#ff3b30";

                remove.style.color =
                    "#fff";

                remove.style.fontSize =
                    "24px";

                remove.addEventListener(
                    "click",
                    () => removeImage(index)
                );

                wrapper.appendChild(image);
                wrapper.appendChild(remove);

                container.appendChild(
                    wrapper
                );

                const reader =
                    new FileReader();

                reader.onload =
                    event => {
                        image.src =
                            event.target.result;
                    };

                reader.readAsDataURL(file);

            }
        );
    }

    function removeImage(index) {

        if (
            index < 0 ||
            index >= state.files.length
        ) {
            return;
        }

        state.files.splice(
            index,
            1
        );

        renderPreview();

        updateStatus();
    }

    function clearImages() {

        state.files = [];

        renderPreview();

        updateStatus();
    }

    function updateStatus() {

        const status =
            document.querySelector(
                "#inspectionStatus"
            ) ||
            document.querySelector(
                "#systemStatus"
            );

        if (!status) return;

        if (!state.files.length) {

            status.textContent =
                "لم تتم إضافة صور.";

            return;
        }

        status.textContent =
            `تم تجهيز ${state.files.length} صورة للفحص.`;
    }

    /* =====================================================
       LIVE CAMERA
       ===================================================== */

    async function openCamera() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            showMessage(
                "المتصفح لا يدعم تشغيل الكاميرا المباشرة."
            );

            return false;
        }

        try {

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

            state.cameraOpen = true;

            showCameraModal();

            const video =
                document.querySelector(
                    "#autoInspectVideo"
                );

            if (video) {

                video.srcObject =
                    state.stream;

                await video.play();
            }

            return true;

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            showMessage(
                "تعذر فتح الكاميرا. تأكد من منح الموقع صلاحية الكاميرا."
            );

            return false;
        }
    }

    function closeCamera() {

        if (state.stream) {

            state.stream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            state.stream = null;
        }

        state.cameraOpen = false;

        const modal =
            document.querySelector(
                "#cameraModal"
            );

        if (modal) {
            modal.remove();
        }
    }

    function capturePhoto() {

        const video =
            document.querySelector(
                "#autoInspectVideo"
            );

        if (!video) return;

        if (
            video.videoWidth <= 0 ||
            video.videoHeight <= 0
        ) {

            showMessage(
                "الكاميرا لم تصبح جاهزة بعد."
            );

            return;
        }

        const canvas =
            document.createElement(
                "canvas"
            );

        const dimensions =
            resizeDimensions(
                video.videoWidth,
                video.videoHeight
            );

        canvas.width =
            dimensions.width;

        canvas.height =
            dimensions.height;

        const context =
            canvas.getContext(
                "2d"
            );

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            blob => {

                if (!blob) return;

                const filename =
                    `vehicle-${Date.now()}.jpg`;

                const file =
                    new File(
                        [blob],
                        filename,
                        {
                            type:
                                "image/jpeg"
                        }
                    );

                addFiles([file]);

            },
            "image/jpeg",
            CONFIG.imageQuality
        );
    }

    function showCameraModal() {

        if (
            document.querySelector(
                "#cameraModal"
            )
        ) {
            return;
        }

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "cameraModal";

        modal.style.position =
            "fixed";

        modal.style.inset =
            "0";

        modal.style.zIndex =
            "10000";

        modal.style.background =
            "rgba(0,0,0,.94)";

        modal.style.display =
            "flex";

        modal.style.alignItems =
            "center";

        modal.style.justifyContent =
            "center";

        const panel =
            document.createElement(
                "div"
            );

        panel.style.width =
            "min(900px,95vw)";

        panel.style.background =
            "#071426";

        panel.style.padding =
            "18px";

        panel.style.borderRadius =
            "22px";

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            "كاميرا AutoInspect AI";

        title.style.color =
            "#20E3B2";

        const video =
            document.createElement(
                "video"
            );

        video.id =
            "autoInspectVideo";

        video.autoplay =
            true;

        video.playsInline =
            true;

        video.muted =
            true;

        video.style.width =
            "100%";

        video.style.maxHeight =
            "65vh";

        video.style.objectFit =
            "contain";

        video.style.borderRadius =
            "16px";

        const controls =
            document.createElement(
                "div"
            );

        controls.style.display =
            "flex";

        controls.style.gap =
            "10px";

        controls.style.marginTop =
            "15px";

        controls.style.justifyContent =
            "center";

        const capture =
            document.createElement(
                "button"
            );

        capture.textContent =
            "📷 التقاط الصورة";

        capture.addEventListener(
            "click",
            capturePhoto
        );

        const close =
            document.createElement(
                "button"
            );

        close.textContent =
            "إغلاق";

        close.addEventListener(
            "click",
            closeCamera
        );

        controls.appendChild(
            capture
        );

        controls.appendChild(
            close
        );

        panel.appendChild(
            title
        );

        panel.appendChild(
            video
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
    }

    function showMessage(message) {

        const existing =
            document.querySelector(
                "#autoInspectToast"
            );

        if (existing) {
            existing.remove();
        }

        const toast =
            document.createElement(
                "div"
            );

        toast.id =
            "autoInspectToast";

        toast.textContent =
            message;

        toast.style.position =
            "fixed";

        toast.style.bottom =
            "25px";

        toast.style.left =
            "50%";

        toast.style.transform =
            "translateX(-50%)";

        toast.style.zIndex =
            "11000";

        toast.style.background =
            "#10243d";

        toast.style.color =
            "#fff";

        toast.style.padding =
            "14px 20px";

        toast.style.borderRadius =
            "14px";

        toast.style.boxShadow =
            "0 12px 35px rgba(0,0,0,.4)";

        document.body.appendChild(
            toast
        );

        setTimeout(
            () => toast.remove(),
            3500
        );
    }

    const api = {

        init,

        addFiles,

        removeImage,

        clearImages,

        openCamera,

        closeCamera,

        capturePhoto,

        getFiles: () =>
            [...state.files],

        getCount: () =>
            state.files.length

    };

    return api;

})();

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            AutoInspectCamera.init()
    );

} else {

    AutoInspectCamera.init();

}

window.AutoInspectCamera =
    AutoInspectCamera;
