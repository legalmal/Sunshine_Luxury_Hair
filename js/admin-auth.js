/* =========================================
   SUNSHINE'S LUXURY HAIR
   ADMIN AUTHENTICATION
   Firebase Authentication
========================================= */

import {
    auth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "./firebase.js";


/* =========================================
   PAGE DETECTION
========================================= */

const currentPage = window.location.pathname.toLowerCase();

const isLoginPage =
    currentPage.endsWith("/login.html") ||
    currentPage.endsWith("login.html");


/* =========================================
   LOGIN ELEMENTS
========================================= */

const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");


/* =========================================
   ADMIN PAGE PROTECTION
========================================= */

const protectAdminPage = () => {

    /*
       These pages require Firebase authentication.
    */

    if (!isLoginPage) {

        onAuthStateChanged(auth, (user) => {

            if (!user) {

                window.location.href = "login.html";

            }

        });

    }

};


/* =========================================
   LOGIN PAGE AUTH STATE
========================================= */

const handleLoginPageAuth = () => {

    if (!isLoginPage) {
        return;
    }

    onAuthStateChanged(auth, (user) => {

        /*
           If the admin is already logged in,
           don't allow them to remain on login.html.
        */

        if (user) {

            window.location.href = "dashboard.html";

        }

    });

};


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

const setupPasswordToggle = () => {

    if (!togglePassword || !passwordInput) {
        return;
    }


    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent = "Hide";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "Show";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

};


/* =========================================
   DISPLAY LOGIN MESSAGE
========================================= */

const showLoginMessage = (message, type = "error") => {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent = message;
    loginMessage.classList.remove("is-success", "is-error", "is-loading");
    loginMessage.classList.add(`is-${type}`);


    if (type === "success") {

        loginMessage.style.color = "#2e7d32";

    } else if (type === "loading") {

        loginMessage.style.color = "#c9a24d";

    } else {

        loginMessage.style.color = "#b3261e";

    }

};


/* =========================================
   FIREBASE ERROR HANDLER
========================================= */

const getFirebaseErrorMessage = (error) => {

    switch (error.code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No account was found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/user-disabled":
            return "This administrator account has been disabled.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email/password authentication is not enabled in Firebase.";

        default:
            console.error("Firebase authentication error:", error);

            return "Login failed. Please try again.";

    }

};


/* =========================================
   LOGIN
========================================= */

const setupLogin = () => {

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /*
           Make sure the required fields exist.
        */

        if (!emailInput || !passwordInput) {

            showLoginMessage(
                "Login form is not configured correctly."
            );

            return;

        }


        const email = emailInput.value.trim();
        const password = passwordInput.value;


        /*
           Validate email.
        */

        if (!email) {

            showLoginMessage(
                "Please enter your email address."
            );

            emailInput.focus();

            return;

        }


        /*
           Validate password.
        */

        if (!password) {

            showLoginMessage(
                "Please enter your password."
            );

            passwordInput.focus();

            return;

        }


        /*
           Disable submit button while Firebase
           processes the login.
        */

        const submitButton =
            loginForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.dataset.originalText =
                submitButton.textContent;

            submitButton.textContent = "Signing in...";

        }


        showLoginMessage(
            "Signing in...",
            "loading"
        );


        try {

            /*
               Firebase Authentication
            */

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            /*
               Login successful.
            */

            console.log(
                "Admin login successful:",
                userCredential.user.email
            );


            showLoginMessage(
                "Login successful.",
                "success"
            );


            /*
               Give Firebase a moment to finish
               updating the authentication state.
            */

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 500);


        } catch (error) {

            console.error(
                "Admin login failed:",
                error
            );


            showLoginMessage(
                getFirebaseErrorMessage(error)
            );


            /*
               Enable button again.
            */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    submitButton.dataset.originalText ||
                    "Login";

            }

        }

    });

};


/* =========================================
   LOGOUT
========================================= */

const setupLogout = () => {

    /*
       Your dashboard/products/add/edit pages
       should have:

       <button id="logoutBtn">Logout</button>
    */

    const logoutButton =
        document.getElementById("logoutBtn");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Logging out...";


                await signOut(auth);


                /*
                   Firebase has successfully logged
                   the administrator out.
                */

                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );


                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Logout";

                window.showToast?.("Logout failed. Please try again.", "error");

            }

        }
    );

};


/* =========================================
   INITIALIZE AUTHENTICATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupPasswordToggle();

        setupLogin();

        setupLogout();

        protectAdminPage();

        handleLoginPageAuth();

    }
);
