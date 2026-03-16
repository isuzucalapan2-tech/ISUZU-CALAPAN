<template>
  <div class="min-h-screen flex font-sans relative">
    
    <div class="w-full md:w-2/5 flex items-center justify-center bg-white relative overflow-hidden">

      <div class="absolute top-0 left-0 w-full z-0">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>

      <div class="w-full max-w-xs p-6 z-10">
        <h2 class="text-2xl text-center mb-4 text-red-600 isuzu-font uppercase tracking-widest">
          Reset Password
        </h2>
        
        <p class="text-center text-[11px] text-neutral-500 mb-8 px-2">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>

        <form @submit.prevent="handleReset">
          <div class="relative mb-8">
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder=" "
              class="peer w-full px-5 py-3 text-sm border border-neutral-300 rounded-2xl
                     focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
            <label
              for="email"
              class="absolute left-5 px-1 bg-white text-neutral-400 text-[10px] uppercase tracking-wider
                     transition-all duration-200 ease-in-out pointer-events-none
                     top-3 peer-focus:-top-2.5 peer-focus:text-red-400
                     peer-[:not(:placeholder-shown)]:-top-2.5 isuzu-font"
            >
              Email Address
            </label>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-neutral-700 text-white py-3 rounded-full uppercase tracking-widest
                   hover:bg-neutral-800 transition disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center justify-center gap-2 isuzu-font shadow-md"
          >
            <span
              v-if="isLoading"
              class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
            ></span>
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-[11px] text-neutral-600">
            Remembered your password?
            <router-link to="/login" class="text-red-600 font-bold hover:underline ml-1">
              Login here
            </router-link>
          </p>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full z-0">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>
    </div>

    <div
      class="hidden md:block md:w-3/5 relative bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>

      <div class="absolute top-8 left-8 z-10 flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="text-white">
            <h1 class="text-lg font-semibold tracking-wide">
              <span class="text-blue-600">Mina</span>
              <span class="text-yellow-500 mx-1">de</span>
              <span class="text-red-700">Oro</span>
            </h1>
            <div class="w-25 h-0.5 bg-neutral-800 my-1"></div>
            <p class="text-[10px] text-center tracking-[0.2em] opacity-80 text-white font-bold">Motors</p>
          </div>
        </div>
        <div class="h-10 w-px bg-white/40"></div>
        <div class="flex items-center gap-4">
          <div class="text-white isuzu-font">
            <h1 class="text-3xl tracking-tighter">I S U Z U</h1>
            <p class="text-[12px] tracking-[0.2em] opacity-80">CALAPAN CITY</p>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-0 right-0 z-10 flex justify-center text-white text-[10px] uppercase tracking-widest opacity-70">
        <div class="flex items-center divide-x divide-white/30 isuzu-font">
          <span class="px-4">HR Department</span>
          <span class="px-4">Sales Department</span>
          <span class="px-4">After Sales Department</span>
          <span class="px-4 border-r-0">Admin Department</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { auth } from "../Firebase/Firebase"; // Ensure auth is exported from your Firebase config
import { sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "../composables/useToast";
import { ArrowLeft } from "lucide-vue-next"; 
import bgLogin from "../assets/isuzubg_login2.jpg";

const bgImage = bgLogin;
const email = ref("");
const isLoading = ref(false);
const toast = useToast();

const handleReset = async () => {
  if (!email.value) return;

  isLoading.value = true;
  try {
    await sendPasswordResetEmail(auth, email.value);
    
    toast.success(
      "If an account exists for this email, a reset link has been sent.",
      "Check your Inbox"
    );
    
    // Optional: clear email field or redirect back to login
    email.value = "";
    
  } catch (error) {
    console.error("Reset error:", error.code);
    // Generic error message for security reasons
    toast.error("Failed to process request. Please try again later.", "Error");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>