<template>
  <div class="min-h-screen flex">

    <!-- LEFT: REGISTER FORM -->
    <div class="w-full md:w-2/5 flex items-center justify-center bg-white">
      <div class="w-full max-w-2xl p-8">

        <h2 class="text-3xl font-bold text-center mb-6 text-gray-800">
          Register
        </h2>

        <form @submit.prevent="register">

          <!-- ROW 1: Last, First, Middle -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-1">Last Name</label>
              <input
                v-model="lastName"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                style="text-transform:uppercase"
                @input="lastName = lastName.toUpperCase()"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">First Name</label>
              <input
                v-model="firstName"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                style="text-transform:uppercase"
                @input="firstName = firstName.toUpperCase()"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Middle</label>
              <input
                v-model="middleInitial"
                maxlength="1"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                style="text-transform:uppercase"
                @input="middleInitial = middleInitial.toUpperCase()"
              />
            </div>
          </div>

          <!-- ROW 2: Username, Email, Contact -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-1">Username</label>
              <input
                v-model="username"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Contact</label>
              <input
                v-model="contactNumber"
                @input="onContactInput"
                maxlength="13"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- ROW 3: Gender, Birthday -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium mb-1">Gender</label>
              <select
                v-model="gender"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Birthday</label>
              <input
                v-model="birthday"
                type="date"
                required
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- ROW 4: Password -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- ROW 5: Confirm Password -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- TERMS -->
          <div class="mb-4 flex items-start">
            <input type="checkbox" v-model="termsAgreed" class="mt-1 mr-2" />
            <span class="text-sm">
              I agree to the
              <a href="/terms" class="text-blue-600 underline">Terms</a> and
              <a href="/privacy" class="text-blue-600 underline">Privacy Policy</a>
            </span>
          </div>

          <!-- ERROR -->
          <p v-if="error" class="text-red-600 text-center mb-3">
            {{ error }}
          </p>

          <!-- SUCCESS -->
          <p v-if="successMessage" class="text-green-700 text-center mb-3">
            {{ successMessage }}
          </p>

          <!-- REGISTER BUTTON -->
          <button
            type="submit"
            class="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition mb-4"
          >
            Register
          </button>

          <!-- LOGIN LINK -->
          <p class="text-center text-sm text-gray-700">
            Have an account?
            <router-link to="/" class="text-blue-600 font-medium hover:underline">
              Login
            </router-link>
          </p>

        </form>
      </div>
    </div>

    <!-- RIGHT: BACKGROUND -->
    <div
      class="hidden md:block md:w-3/5 bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
    ></div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../Firebase/Firebase";
import bgRegister from "../assets/isuzubg_login2.jpg";


const bgImage = bgRegister;
const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const middleInitial = ref("");
const username = ref("");
const email = ref("");
const contactNumber = ref("+63");
const gender = ref("");
const birthday = ref("");
const password = ref("");
const confirmPassword = ref("");
const termsAgreed = ref(false);

const error = ref("");
const successMessage = ref("");

const register = async () => {
  error.value = "";
  successMessage.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  if (!termsAgreed.value) {
    error.value = "You must agree to the terms.";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);

    await updateProfile(cred.user, { displayName: username.value });

    await setDoc(doc(db, "Administrator", cred.user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      middleInitial: middleInitial.value,
      username: username.value,
      email: email.value,
      contact: contactNumber.value,
      gender: gender.value,
      birthday: birthday.value,
      emailVerified: false,
      createdAt: new Date()
    });

    await sendEmailVerification(cred.user);

    // Sign out the user immediately so they can't access protected routes
    await signOut(auth);

    successMessage.value = "Registration successful! Please check your email to verify your account before logging in.";
    
    // Redirect to login after showing message
    setTimeout(() => router.push("/"), 3000);

  } catch (err) {
    console.error("Registration error:", err);
    error.value = "Registration failed. Try again.";
  }

};

function onContactInput(e) {
  if (!e.target.value.startsWith("+63")) {
    contactNumber.value = "+63";
  }
}
</script>

<style scoped>
input:focus,
select:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb;
}
</style>
