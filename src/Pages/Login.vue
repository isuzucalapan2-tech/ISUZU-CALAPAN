<template>
  <div class="min-h-screen flex font-sans relative">
    
    <!-- LEFT SIDE -->
    <div class="w-full md:w-2/5 flex items-center justify-center bg-white relative overflow-hidden">

      <!-- BACK TO LANDING ICON -->
      <router-link
        to="/"
        class="absolute top-4 left-135 z-20 flex items-center gap-1 text-red-600 hover:text-red-700 isuzu-font"
      >
        <ArrowLeft size="18" />
        <span class="text-sm">Home</span>
      </router-link>

      <!-- TOP SVG -->
      <div class="absolute top-0 left-0 w-full z-0">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>

      <!-- LOGIN CARD -->
      <div class="w-full max-w-xs p-6 z-10">
        <h2 class="text-3xl text-center mb-10 text-red-600 isuzu-font uppercase tracking-widest">
          Login
        </h2>

        <form @submit.prevent="handleLogin">
          <!-- USERNAME -->
          <div class="relative mb-6">
            <input
              id="identifier"
              v-model="identifier"
              type="text"
              required
              placeholder=" "
              class="peer w-full px-5 py-3 text-sm border border-neutral-300 rounded-2xl
                     focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
            <label
              for="identifier"
              class="absolute left-5 px-1 bg-white text-neutral-400 text-[10px] uppercase tracking-wider
                     transition-all duration-200 ease-in-out pointer-events-none
                     top-3 peer-focus:-top-2.5 peer-focus:text-red-400
                     peer-[:not(:placeholder-shown)]:-top-2.5 isuzu-font"
            >
              Username or Email
            </label>
          </div>

          <!-- PASSWORD -->
          <div class="relative mb-4">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder=" "
              class="peer w-full px-5 py-3 pr-12 text-sm border border-neutral-300 rounded-2xl 
                     focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
            <label
              for="password"
              class="absolute left-5 px-1 bg-white text-neutral-400 text-[10px] uppercase tracking-wider
                     transition-all duration-200 ease-in-out pointer-events-none
                     top-3 peer-focus:-top-2.5 peer-focus:text-red-400
                     peer-[:not(:placeholder-shown)]:-top-2.5 isuzu-font"
            >
              Password
            </label>

            <!-- TOGGLE BUTTON -->
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/3 text-neutral-400 hover:text-red-500 transition"
            >
              <Eye v-if="!showPassword" size="18" />
              <EyeOff v-else size="18" />
            </button>
          </div>

          <!-- REMEMBER -->
          <div class="mb-6 flex items-center px-2">
            <input
              v-model="rememberMe"
              type="checkbox"
              id="remember"
              class="mr-2 accent-red-600 scale-90"
            />
            <label for="remember" class="text-xs text-neutral-500">
              Remember me
            </label>
          </div>

          <!-- LOGIN BUTTON -->
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
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="text-center text-[11px] text-neutral-600 mt-8">
          Don't have an account?
          <router-link to="/register" class="text-red-600 font-bold hover:underline ml-1">
            Register
          </router-link>
        </p>
      </div>

      <!-- BOTTOM SVG -->
      <div class="absolute bottom-0 left-0 w-full z-0">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>
    </div>

    <!-- RIGHT SIDE IMAGE -->
    <div
      class="hidden md:block md:w-3/5 relative bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>

      <!-- TOP LEFT LOGO SECTION -->
      <div class="absolute top-8 left-8 z-10 flex items-center gap-6">

         <!-- MDO -->
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

        <!-- Divider -->
        <div class="h-10 w-px bg-white/40"></div>

        <!-- ISUZU -->
        <div class="flex items-center gap-4">
          <div class="text-white isuzu-font">
            <h1 class="text-3xl tracking-tighter">I S U Z U</h1>
            <p class="text-[12px] tracking-[0.2em] opacity-80">CALAPAN CITY</p>
          </div>
        </div>

      </div>

      <!-- BOTTOM DEPARTMENTS -->
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import { useToast } from "../composables/useToast";
import { Eye, EyeOff, ArrowLeft } from "lucide-vue-next"; 
import bgLogin from "../assets/isuzubg_login2.jpg";


const bgImage = bgLogin;

const identifier = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
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
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
