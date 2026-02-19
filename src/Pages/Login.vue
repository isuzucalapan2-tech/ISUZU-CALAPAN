<template>
  <div class="min-h-screen flex">

    <!-- LEFT: Login Form (Smaller White Section) -->
    <div class="w-full md:w-2/5 flex items-center justify-center bg-white">
      <div class="w-full max-w-sm p-8">
        <h2 class="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <form @submit.prevent="handleLogin">
          <!-- Username or Email -->
          <div class="mb-4">
            <label class="block text-gray-800 mb-1 font-medium">
              Username or Email
            </label>
            <input
              v-model="identifier"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username or email"
            />
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label class="block text-gray-800 mb-1 font-medium">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>


          <!-- Remember Me -->
          <div class="mb-4 flex items-center">
            <input
              v-model="rememberMe"
              type="checkbox"
              id="remember"
              class="mr-2"
            />
            <label for="remember" class="text-sm text-gray-600">Remember me</label>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

        </form>

        <!-- Email verification -->
        <div v-if="showVerificationNotice" class="mt-4">
          <p class="text-red-600 text-sm text-center mb-2">
            Your email is not verified.
          </p>
          <button
            @click="resendVerification"
            :disabled="resendLoading"
            class="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="resendLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></span>
            {{ resendLoading ? "Sending..." : "Resend Verification Email" }}
          </button>
        </div>


        <!-- Register -->
        <p class="text-center text-sm text-gray-800 mt-6">
          Don't have an account?
          <router-link to="/register" class="text-red-600 underline">
            Register
          </router-link>
        </p>
      </div>
    </div>

    <!-- RIGHT: Background Image (Bigger Area) -->
    <div
      class="hidden md:block md:w-3/5 bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
    ></div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useToast } from "../composables/useToast";

import bgLogin from "../assets/isuzubg_login2.jpg";


const bgImage = bgLogin;

const identifier = ref("");
const password = ref("");
const rememberMe = ref(false);
const showVerificationNotice = ref(false);
const resendLoading = ref(false);
const isLoading = ref(false);


const route = useRoute();
const router = useRouter();
const { login, resendVerification: authResendVerification, isAuthenticated } = useAuth();
const toast = useToast();


// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    const redirect = route.query.redirect || '/admin/dashboard';
    router.push(redirect);
  }
});

const handleLogin = async () => {
  showVerificationNotice.value = false;
  isLoading.value = true;

  // Check for session expired query param
  if (route.query.session === 'expired') {
    toast.warning("Your session has expired. Please log in again.", "Session Expired");
  }

  try {
    let emailToLogin = identifier.value;
    let adminDoc = null;
    let adminId = null;

    // If identifier is not an email, look up the username
    if (!identifier.value.includes("@")) {
      const q = query(
        collection(db, "Administrator"),
        where("username", "==", identifier.value)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        toast.error("Username not found.", "Login Failed");
        isLoading.value = false;
        return;
      }
      adminDoc = snap.docs[0].data();
      adminId = snap.docs[0].id;
      emailToLogin = adminDoc.email;
    } else {
      // If email, look up the administrator by email
      const q = query(
        collection(db, "Administrator"),
        where("email", "==", identifier.value)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        adminDoc = snap.docs[0].data();
        adminId = snap.docs[0].id;
      }
    }

    // Check if administrator exists
    if (!adminDoc) {
      toast.error("Account not found.", "Login Failed");
      isLoading.value = false;
      return;
    }

    // Check accountStatus
    if (adminDoc.accountStatus === "pending") {
      toast.warning("Your account is pending approval. Please wait for an administrator to approve your account.", "Account Pending");
      isLoading.value = false;
      return;
    }

    if (adminDoc.accountStatus === "denied") {
      toast.error("Your account has been denied. Please contact an administrator for assistance.", "Access Denied");
      isLoading.value = false;
      return;
    }

    // Check Status (Deactivated)
    if (adminDoc.Status === "Deactivated") {
      toast.error("Your account has been deactivated. Please contact an administrator to reactivate your account.", "Account Deactivated");
      isLoading.value = false;
      return;
    }

    // Attempt login
    const result = await login(emailToLogin, password.value, rememberMe.value);

    if (!result.success) {
      if (result.error === 'Please verify your email first.') {
        showVerificationNotice.value = true;
        toast.error("Please verify your email before logging in.", "Email Not Verified");
      } else {
        toast.error(result.error, "Login Failed");
      }
      isLoading.value = false;
      return;
    }

    // Check email verification after successful Firebase login
    if (!result.user.emailVerified) {
      showVerificationNotice.value = true;
      toast.error("Please verify your email before logging in.", "Email Not Verified");
      isLoading.value = false;
      return;
    }

    toast.success("Login successful! Redirecting...", "Welcome Back!");
    
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect || '/admin/dashboard';
    setTimeout(() => router.push(redirect), 1200);

  } catch (err) {
    toast.error("Login failed. Please try again.", "Error");
    isLoading.value = false;
  }
};


const resendVerification = async () => {
  resendLoading.value = true;
  const result = await authResendVerification();
  if (result.success) {
    toast.success("Verification email sent. Please check your inbox.", "Email Sent");
  } else {
    toast.error(result.error || "Failed to resend email.", "Error");
  }
  resendLoading.value = false;
};

</script>

<style scoped>
.border-red-500 {
  border-color: #ef4444;
}
</style>
