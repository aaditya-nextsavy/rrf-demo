(() => {
    const FORM_SELECTOR = ".footer-contact-form";
    const API_ENDPOINT = "./PHPMailer/api/send-contact.php";
    const RECAPTCHA_SITE_KEY = "6LcnNf8sAAAAADi5v4um4S59vMhmknx35QTOHRwT";
    const RECAPTCHA_SCRIPT_SRC = "https://www.google.com/recaptcha/api.js";
    const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s.'-]{1,}$/;
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const forms = Array.from(document.querySelectorAll(FORM_SELECTOR));

    if (!forms.length) {
        return;
    }

    let popupTimeoutId = null;
    let popupNode = null;

    let recaptchaPromise = null;

    const loadRecaptcha = () => {
        if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
            return Promise.resolve(window.grecaptcha);
        }

        if (!recaptchaPromise) {
            recaptchaPromise = new Promise((resolve, reject) => {
                const existingScript = document.querySelector(`script[src="${RECAPTCHA_SCRIPT_SRC}"]`);

                if (existingScript) {
                    existingScript.addEventListener("load", () => resolve(window.grecaptcha));
                    existingScript.addEventListener("error", reject);
                    return;
                }

                const script = document.createElement("script");
                script.src = RECAPTCHA_SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                script.onload = () => resolve(window.grecaptcha);
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        return recaptchaPromise;
    };

    const ensurePopup = () => {
        if (popupNode) {
            return popupNode;
        }

        popupNode = document.createElement("div");
        popupNode.className = "footer-contact-form-popup";
        popupNode.setAttribute("aria-hidden", "true");
        popupNode.innerHTML = `
            <div class="footer-contact-form-popup__panel" role="dialog" aria-modal="true" aria-live="assertive">
                <button type="button" class="footer-contact-form-popup__close" aria-label="Close notification">&times;</button>
                <div class="footer-contact-form-popup__content">
                <img src="./assets/media/icons/rrf-logo.png" />
                    <p class="footer-contact-form-popup__message"></p>
                </div>
            </div>
        `;

        document.body.appendChild(popupNode);

        popupNode.querySelector(".footer-contact-form-popup__close")?.addEventListener("click", () => {
            hidePopup();
        });

        popupNode.addEventListener("click", (event) => {
            if (event.target === popupNode) {
                hidePopup();
            }
        });

        return popupNode;
    };

    const hidePopup = () => {
        const node = ensurePopup();
        node.dataset.visible = "false";
        node.setAttribute("aria-hidden", "true");

        if (popupTimeoutId) {
            clearTimeout(popupTimeoutId);
            popupTimeoutId = null;
        }
    };

    const showPopup = (message, type) => {
        const node = ensurePopup();
        const messageNode = node.querySelector(".footer-contact-form-popup__message");

        if (messageNode) {
            messageNode.textContent = message;
        }

        node.dataset.status = type;
        node.dataset.visible = "true";
        node.setAttribute("aria-hidden", "false");

        if (popupTimeoutId) {
            clearTimeout(popupTimeoutId);
        }

        popupTimeoutId = window.setTimeout(() => {
            hidePopup();
        }, 45000000000);
    };

    const getFieldMessage = (fieldType, value) => {
        const trimmed = value.trim();

        if (!trimmed) {
            return "This field is required.";
        }

        switch (fieldType) {
            case "first_name":
            case "last_name":
                return NAME_PATTERN.test(trimmed) ? "" : "Please enter a valid name.";
            case "mobile_number": {
                const digits = trimmed.replace(/\D/g, "");
                return digits.length >= 10 && digits.length <= 15
                    ? ""
                    : "Please enter a valid mobile number.";
            }
            case "email":
                return EMAIL_PATTERN.test(trimmed) ? "" : "Please enter a valid email address.";
            case "message":
                return trimmed.length >= 10 ? "" : "Please enter at least 10 characters.";
            default:
                return "";
        }
    };

    const setFieldState = (form, config, showError, index) => {
        const input = config.input;

        if (!input) {
            return true;
        }

        const errorMessage = getFieldMessage(config.name, input.value);
        const wrapper = input.closest(".footer-contact-form-field");
        let errorNode = form.querySelector(`#${config.name}-error-${index}`);

        if (showError && errorMessage) {
            wrapper?.classList.add("footer-contact-form-field--has-error");
            input.setAttribute("aria-invalid", "true");

            if (!errorNode) {
                errorNode = document.createElement("span");
                errorNode.className = "footer-contact-form-error";
                errorNode.id = `${config.name}-error-${index}`;
                errorNode.setAttribute("aria-live", "polite");
                input.insertAdjacentElement("afterend", errorNode);
                input.setAttribute("aria-describedby", `${config.name}-error-${index}`);
            }

            if (errorNode) {
                errorNode.textContent = errorMessage;
            }
        } else {
            wrapper?.classList.remove("footer-contact-form-field--has-error");
            input.setAttribute("aria-invalid", "false");
            input.removeAttribute("aria-describedby");

            if (errorNode) {
                errorNode.remove();
            }
        }

        return !errorMessage;
    };

    const enhanceForm = async (form, index) => {
        form.setAttribute("novalidate", "novalidate");
        form.setAttribute("action", API_ENDPOINT);
        form.setAttribute("method", "post");

        const fields = Array.from(form.querySelectorAll(".footer-contact-form-field"));
        const submitButton = form.querySelector('button[type="submit"]');
        const textareaField = fields.at(-1);
        const submitButtonOriginalHTML = submitButton?.innerHTML ?? "Send Message";
        const state = {
            captchaWidgetId: null,
            captchaToken: "",
            captchaReady: false,
            submittedOnce: false,
            isSubmitting: false,
        };

        const fieldConfigs = [
            {
                name: "first_name",
                input: fields[0]?.querySelector("input"),
                autocomplete: "given-name",
                placeholder: "Enter First Name",
            },
            {
                name: "last_name",
                input: fields[1]?.querySelector("input"),
                autocomplete: "family-name",
                placeholder: "Enter Last Name",
            },
            {
                name: "mobile_number",
                input: fields[2]?.querySelector("input"),
                autocomplete: "tel",
                inputMode: "tel",
                placeholder: "Enter Mobile Number",
            },
            {
                name: "email",
                input: fields[3]?.querySelector("input"),
                autocomplete: "email",
                placeholder: "Enter Email ID",
            },
            {
                name: "message",
                input: textareaField?.querySelector("textarea"),
                autocomplete: "off",
                placeholder: "Write A Message...",
            },
        ];

        fieldConfigs.forEach((config) => {
            const input = config.input;

            if (!input) {
                return;
            }

            input.name = config.name;
            input.id = `${config.name}-${index}`;
            input.required = true;
            input.setAttribute("aria-describedby", `${config.name}-error-${index}`);
            input.setAttribute("autocomplete", config.autocomplete);
            input.placeholder = config.placeholder;

            if (config.inputMode) {
                input.setAttribute("inputmode", config.inputMode);
            }

            if (config.name === "mobile_number") {
                input.setAttribute("pattern", "[0-9()+\\s-]*");
            }
        });

        let captchaField = form.querySelector(".footer-contact-form-captcha");

        if (!captchaField) {
            captchaField = document.createElement("div");
            captchaField.className = "footer-contact-form-captcha";
            captchaField.innerHTML = `<div id="recaptcha-${index}"></div>`;
            textareaField?.insertAdjacentElement("afterend", captchaField);
        }

        const captchaContainer = captchaField.querySelector(`#recaptcha-${index}`);
        const getCaptchaErrorNode = () => captchaField.querySelector(`#captcha-error-${index}`);
        const showCaptchaError = (message) => {
            let captchaError = getCaptchaErrorNode();

            if (!captchaError) {
                captchaError = document.createElement("span");
                captchaError.className = "footer-contact-form-error";
                captchaError.id = `captcha-error-${index}`;
                captchaError.setAttribute("aria-live", "polite");
                captchaField.appendChild(captchaError);
            }

            captchaError.textContent = message;
        };
        const clearCaptchaError = () => {
            getCaptchaErrorNode()?.remove();
        };

        const hasRequiredValues = () => fieldConfigs.every((config) => {
            const input = config.input;
            return input ? input.value.trim().length > 0 : false;
        });

        const syncButtonState = () => {
            if (submitButton) {
                submitButton.disabled = state.isSubmitting || !(hasRequiredValues() && state.captchaToken && state.captchaReady);
            }
        };

        const setSubmitLoadingState = (isLoading) => {
            if (!submitButton) {
                return;
            }

            if (isLoading) {
                submitButton.innerHTML = `
                    <span class="footer-contact-form-submit-spinner" aria-hidden="true"></span>
                    <span>Submitting...</span>
                `;
            } else {
                submitButton.innerHTML = submitButtonOriginalHTML;
            }
        };

        const validateForm = () => {
            let isValid = true;

            fieldConfigs.forEach((config) => {
                if (!setFieldState(form, config, true, index)) {
                    isValid = false;
                }
            });

            return isValid;
        };

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            await loadRecaptcha();

            window.grecaptcha.ready(() => {
                state.captchaReady = true;

                if (captchaContainer) {
                    state.captchaWidgetId = window.grecaptcha.render(captchaContainer, {
                        sitekey: RECAPTCHA_SITE_KEY,
                        callback: (token) => {
                            state.captchaToken = token;

                            clearCaptchaError();

                            syncButtonState();
                        },
                        "expired-callback": () => {
                            state.captchaToken = "";
                            syncButtonState();
                        },
                        "error-callback": () => {
                            state.captchaToken = "";

                            showCaptchaError("Captcha failed to load. Please try again.");

                            syncButtonState();
                        },
                    });
                }
            });
        } catch (error) {
            state.captchaReady = false;

            showCaptchaError("Captcha could not be loaded.");
        }

        fieldConfigs.forEach((config) => {
            const input = config.input;

            if (!input) {
                return;
            }

            input.addEventListener("input", () => {
                if (state.submittedOnce) {
                    setFieldState(form, config, true, index);
                }

                syncButtonState();
            });

            input.addEventListener("blur", () => {
                if (state.submittedOnce) {
                    setFieldState(form, config, true, index);
                }
            });
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            state.submittedOnce = true;

            const isFormValid = validateForm();

            if (!isFormValid || !state.captchaToken) {
                if (!state.captchaToken) {
                    showCaptchaError("Please complete the captcha challenge.");
                }

                showPopup("Please fix the highlighted fields and try again.", "error");
                syncButtonState();
                return;
            }

            state.isSubmitting = true;
            setSubmitLoadingState(true);
            syncButtonState();

            try {
                const formData = new FormData(form);
                formData.set("g-recaptcha-response", state.captchaToken);

                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                    },
                });

                const payload = await response.json().catch(() => null);

                if (!response.ok || !payload?.status) {
                    throw new Error(payload?.message || "Unable to send your message right now.");
                }

                form.reset();

                fieldConfigs.forEach((config) => {
                    const input = config.input;
                    const errorNode = form.querySelector(`#${config.name}-error-${index}`);
                    const wrapper = input?.closest(".footer-contact-form-field");

                    if (input) {
                        input.setAttribute("aria-invalid", "false");
                    }

                    wrapper?.classList.remove("footer-contact-form-field--has-error");

                    if (errorNode) {
                        errorNode.remove();
                    }
                });

                showPopup(payload?.message || "Your message has been sent successfully.", "success");
                state.submittedOnce = false;
                state.captchaToken = "";

                if (state.captchaWidgetId !== null && window.grecaptcha) {
                    window.grecaptcha.reset(state.captchaWidgetId);
                }

                clearCaptchaError();
            } catch (error) {
                showPopup(
                    error instanceof Error ? error.message : "Unable to send your message right now.",
                    "error"
                );
            } finally {
                state.isSubmitting = false;
                setSubmitLoadingState(false);
                syncButtonState();
            }
        });

        syncButtonState();
    };

    forms.forEach((form, index) => {
        void enhanceForm(form, index);
    });
})();
