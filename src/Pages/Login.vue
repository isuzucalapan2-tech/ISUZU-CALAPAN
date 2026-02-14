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
              :class="{ 'border-red-500': error }"
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
              :class="{ 'border-red-500': error }"
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

          <!-- Session expired -->
          <p
            v-if="$route.query.session === 'expired'"
            class="text-yellow-700 text-sm mb-4 text-center"
          >
            Your session has expired. Please log in again.
          </p>

          <!-- Error -->
          <p v-if="error" class="text-red-600 text-center mb-4">
            {{ error }}
          </p>

          <!-- Success -->
          <p v-if="successMessage" class="text-green-700 text-center mb-4">
            {{ successMessage }}
          </p>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
          >
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
            class="w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
          >
            {{ resendLoading ? "Sending..." : "Resend Verification Email" }}
          </button>
          <p v-if="resendMessage" class="text-center text-sm mt-2">
            {{ resendMessage }}
          </p>
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
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/Firebase";

import bgLogin from "../assets/isuzubg_login2.jpg";

const bgImage = bgLogin;

const identifier = ref("");
const password = ref("");
const rememberMe = ref(false);
const error = ref("");
const successMessage = ref("");
const showVerificationNotice = ref(false);
const resendLoading = ref(false);
const resendMessage = ref("");
const isLoading = ref(false);

const route = useRoute();
const router = useRouter();
const { login, resendVerification: authResendVerification, isAuthenticated } = useAuth();

// Redirect if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    const redirect = route.query.redirect || '/admin/dashboard';
    router.push(redirect);
  }
});

const handleLogin = async () => {
  error.value = "";
  successMessage.value = "";
  showVerificationNotice.value = false;
  isLoading.value = true;

  try {
    let emailToLogin = identifier.value;

    // If identifier is not an email, look up the username
    if (!identifier.value.includes("@")) {
      const q = query(
        collection(db, "Administrator"),
        where("username", "==", identifier.value)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        error.value = "Username not found.";
        isLoading.value = false;
        return;
      }
      emailToLogin = snap.docs[0].data().email;
    }

    const result = await login(emailToLogin, password.value, rememberMe.value);

    if (!result.success) {
      if (result.error === 'Please verify your email first.') {
        showVerificationNotice.value = true;
      }
      error.value = result.error;
      isLoading.value = false;
      return;
    }

    successMessage.value = "Login successful! Redirecting...";
    
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect || '/admin/dashboard';
    setTimeout(() => router.push(redirect), 1200);

  } catch (err) {
    error.value = "Login failed. Please try again.";
    isLoading.value = false;
  }
};

const resendVerification = async () => {
  resendLoading.value = true;
  const result = await authResendVerification();
  if (result.success) {
    resendMessage.value = "Verification email sent.";
  } else {
    resendMessage.value = result.error || "Failed to resend email.";
  }
  resendLoading.value = false;
};
</script>

<style scoped>
.border-red-500 {
  border-color: #ef4444;
}
</style>
