<template>
  <div class="min-h-screen flex font-sans relative">
    
    <div class="w-full md:w-2/5 flex items-center justify-center bg-white relative overflow-hidden min-h-screen">

      <router-link
        to="/"
        class="absolute top-6 left-6 md:left-10 z-30 flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
      >
        <ArrowLeft size="18" />
        <span class="text-xs md:text-sm font-bold uppercase tracking-wider isuzu-font">Home</span>
      </router-link>
      
      <div class="absolute top-0 left-0 w-full z-0 pointer-events-none">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>

      <div class="w-full max-w-2xl p-6 md:p-8 z-10 mt-16 mb-12">
        <h2 class="text-2xl md:text-3xl text-center mb-8 text-red-600 isuzu-font uppercase tracking-widest">
          Register
        </h2>

        <form @submit.prevent="register" class="space-y-4">

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Last Name</label>
              <input
                v-model="lastName"
                required
                placeholder="Required"
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                style="text-transform:uppercase"
                @input="lastName = lastName.toUpperCase()"
              />
            </div>

            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">First Name</label>
              <input
                v-model="firstName"
                required
                placeholder="Required"
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                style="text-transform:uppercase"
                @input="firstName = firstName.toUpperCase()"
              />
            </div>

            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Middle Name</label>
              <input
                v-model="middleInitial"
                placeholder="Optional"
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                style="text-transform:uppercase"
                @input="middleInitial = middleInitial.toUpperCase()"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Username</label>
              <input
                v-model="username"
                required
                @input="onUsernameInput"
                :class="[
                  'w-full px-4 py-2 text-sm border rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500',
                  usernameError ? 'border-red-500' : 'border-neutral-300'
                ]"
              />
              <p v-if="usernameChecking" class="text-[9px] text-blue-600 mt-1 italic">Checking...</p>
              <p v-else-if="usernameError" class="text-[9px] text-red-600 mt-1">{{ usernameError }}</p>
            </div>

            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Email</label>
              <input
                v-model="email"
                type="email"
                required
                :class="[
                  'w-full px-4 py-2 text-sm border rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500',
                  emailError ? 'border-red-500' : 'border-neutral-300'
                ]"
              />
            </div>

            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Contact</label>
              <input
                v-model="contactNumber"
                @input="onContactInput"
                maxlength="13"
                placeholder="0912..."
                required
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Gender</label>
              <select
                v-model="gender"
                required
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 appearance-none bg-white"
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Birthday</label>
              <input
                v-model="birthday"
                type="date"
                required
                class="w-full px-4 py-2 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="relative">
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Password</label>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 pr-12 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-8.5 text-neutral-400 hover:text-red-500 transition"
              >
                <Eye v-if="!showPassword" size="16" />
                <EyeOff v-else size="16" />
              </button>
            </div>

            <div class="relative">
              <label class="block text-[10px] mb-1 text-neutral-500 uppercase tracking-wider isuzu-font">Confirm Password</label>
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 pr-12 text-sm border border-neutral-300 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-8.5 text-neutral-400 hover:text-red-500 transition"
              >
                <Eye v-if="!showConfirmPassword" size="16" />
                <EyeOff v-else size="16" />
              </button>
            </div>
          </div>

          <div class="py-2 flex items-start gap-2">
            <input type="checkbox" v-model="termsAgreed" class="accent-red-600 mt-1" required />
            <span class="text-[11px] text-neutral-600 leading-tight">
              I agree to the
              <a href="#" class="text-red-600 font-bold hover:underline">Terms</a> and
              <a href="#" class="text-red-600 font-bold hover:underline">Privacy Policy</a>
            </span>
          </div>

          <button
            type="submit"
            :disabled="isRegistering || usernameChecking"
            class="w-full bg-neutral-800 text-white py-3.5 rounded-full uppercase tracking-widest hover:bg-neutral-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 isuzu-font shadow-lg"
          >
            <span v-if="isRegistering" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ isRegistering ? 'Registering...' : 'Create Account' }}
          </button>

          <p class="text-center text-xs text-neutral-600 mt-4">
            Already have an account?
            <router-link to="/login" class="text-red-600 font-bold hover:underline ml-1">
              Login
            </router-link>
          </p>

        </form>
      </div>

      <div class="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
        </svg>
      </div>
    </div>

    <div
      class="hidden md:block md:w-3/5 relative bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
    >
      <div class="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>

      <div class="absolute top-10 left-10 z-10 flex items-center gap-6">
        <div class="flex flex-col uppercase">
          <h1 class="text-xl font-bold tracking-tight">
            <span class="text-blue-500">Mina</span>
            <span class="text-yellow-500 mx-1.5">de</span>
            <span class="text-red-600">Oro</span>
          </h1>
          <div class="w-full h-px bg-white/20 my-1"></div>
          <p class="text-[10px] tracking-[0.3em] text-white font-black opacity-90">Motors inc.</p>
        </div>

        <div class="h-10 w-px bg-white/30"></div>

        <div class="text-white isuzu-font">
          <h1 class="text-4xl tracking-tighter font-black">ISUZU</h1>
          <p class="text-[10px] tracking-[0.4em] text-red-500 font-bold">CALAPAN CITY</p>
        </div>
      </div>

      <div class="absolute bottom-10 left-0 right-0 z-10 flex justify-center text-white text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold">
        <div class="flex items-center divide-x divide-white/20 isuzu-font">
          <span class="px-5">HR</span>
          <span class="px-5">Sales</span>
          <span class="px-5">After Sales</span>
          <span class="px-5">Admin</span>
        </div>
      </div>
    </div> 

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
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Eye, EyeOff, ArrowLeft } from "lucide-vue-next";

import { auth, db } from "../Firebase/Firebase";
import bgRegister from "../assets/isuzubg_login2.jpg";
import { useToast } from "../composables/useToast";



const bgImage = bgRegister;
const router = useRouter();
const toast = useToast();


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

const isRegistering = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);


// Validation states for uniqueness checking
const usernameError = ref("");
const emailError = ref("");
const usernameChecking = ref(false);
const emailChecking = ref(false);
const isUsernameTaken = ref(false);
const isEmailTaken = ref(false);

// Debounce timer refs
let usernameDebounceTimer = null;
let emailDebounceTimer = null;



// Debounce utility function
const debounce = (func, wait) => {
  return (...args) => {
    clearTimeout(usernameDebounceTimer);
    usernameDebounceTimer = setTimeout(() => func.apply(this, args), wait);
  };
};

// Check if username already exists in Firestore
const checkUsernameExists = async (username) => {
  if (!username || username.trim().length < 3) {
    usernameError.value = "";
    isUsernameTaken.value = false;
    return;
  }

  usernameChecking.value = true;
  usernameError.value = "";

  try {
    const q = query(
      collection(db, "Administrator"),
      where("username", "==", username.trim())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      isUsernameTaken.value = true;
      usernameError.value = "Username is already taken";
      toast.error("Username is already taken", "Validation Error");
    } else {
      isUsernameTaken.value = false;
      usernameError.value = "";
    }
  } catch (err) {
    console.error("Error checking username:", err);
    usernameError.value = "Unable to verify username availability";
    toast.error("Unable to verify username availability", "Error");
  } finally {
    usernameChecking.value = false;
  }
};


// Check if email already exists in Firestore
const checkEmailExists = async (email) => {
  if (!email || !email.includes("@")) {
    emailError.value = "";
    isEmailTaken.value = false;
    return;
  }

  emailChecking.value = true;
  emailError.value = "";

  try {
    const q = query(
      collection(db, "Administrator"),
      where("email", "==", email.trim().toLowerCase())
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      isEmailTaken.value = true;
      emailError.value = "Email is already registered";
      toast.error("Email is already registered", "Validation Error");
    } else {
      isEmailTaken.value = false;
      emailError.value = "";
    }
  } catch (err) {
    console.error("Error checking email:", err);
    emailError.value = "Unable to verify email availability";
    toast.error("Unable to verify email availability", "Error");
  } finally {
    emailChecking.value = false;
  }
};


// Debounced versions for input events
const debouncedCheckUsername = debounce(checkUsernameExists, 500);
const debouncedCheckEmail = debounce(checkEmailExists, 500);

// Helper function to calculate age from birthday
const calculateAge = (birthDate) => {

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Helper function to fetch default role values
const fetchDefaultRoleValues = async () => {
  try {
    // Fetch position from Position_Access collection
    const positionDoc = await getDoc(doc(db, "Position_Access", "isuzu$calapan$position201"));
    const position = positionDoc.exists() ? positionDoc.data().position : "";

    // Fetch role from Role_Access collection
    const roleDoc = await getDoc(doc(db, "Role_Access", "isuzu&calapan&staff103"));
    const role = roleDoc.exists() ? roleDoc.data().roleName : "";

    // Fetch permission from Permission_Access collection
    const permissionDoc = await getDoc(doc(db, "Permission_Access", "isuzu#calapan#permission305"));
    const permission = permissionDoc.exists() ? permissionDoc.data().permission : "";

    return { position, role, permission };
  } catch (err) {
    console.error("Error fetching default role values:", err);
    return { position: "", role: "", permission: "" };
  }
};

const register = async () => {
  // Prevent multiple submissions
  if (isRegistering.value) return;
  
  isRegistering.value = true;


  if (password.value !== confirmPassword.value) {
    toast.error("Passwords do not match", "Validation Error");
    isRegistering.value = false;
    return;
  }

  if (!termsAgreed.value) {
    toast.error("You must agree to the terms and conditions", "Validation Error");
    isRegistering.value = false;
    return;
  }

  // Check uniqueness before proceeding
  await checkUsernameExists(username.value);
  await checkEmailExists(email.value);

  if (isUsernameTaken.value) {
    toast.error("Username is already taken. Please choose a different username.", "Registration Failed");
    isRegistering.value = false;
    return;
  }

  if (isEmailTaken.value) {
    toast.error("Email is already registered. Please use a different email or login.", "Registration Failed");
    isRegistering.value = false;
    return;
  }



  try {

    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);

    await updateProfile(cred.user, { displayName: username.value });

    // Fetch default role values
    const defaultRoles = await fetchDefaultRoleValues();

    // Create Administrator document
    await setDoc(doc(db, "Administrator", cred.user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      middleInitial: middleInitial.value,
      username: username.value,
      email: email.value,
      contact: contactNumber.value,
      gender: gender.value,
      birthday: birthday.value,
      age: calculateAge(birthday.value),
      termsAgreed: true,
      termsAgreedAt: new Date(),
      accountStatus: "pending",
      emailVerified: false,
      createdAt: new Date(),
      Status: "Deactivated"
    });


    // Create Roles subcollection with default values
    await setDoc(doc(db, "Administrator", cred.user.uid, "Roles", "Default_Roles"), {
      position: defaultRoles.position,
      role: defaultRoles.role,
      permission: defaultRoles.permission,
      setAt: new Date(),
      updateAt: null
    });

    await sendEmailVerification(cred.user);

    // Sign out the user immediately so they can't access protected routes
    await signOut(auth);

    toast.success(
      "Registration successful! Please check your email to verify your account before logging in.",
      "Welcome!",
      8000
    );
    
    // Redirect to login after showing message
    setTimeout(() => router.push("/"), 3000);


  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle specific Firebase Auth errors with toast notifications
    if (err.code === "auth/email-already-in-use") {
      toast.error("This email is already registered. Please use a different email or login.", "Registration Failed");
    } else if (err.code === "auth/invalid-email") {
      toast.error("Please enter a valid email address.", "Invalid Email");
    } else if (err.code === "auth/weak-password") {
      toast.error("Password is too weak. Please use at least 6 characters.", "Weak Password");
    } else {
      toast.error("Registration failed. Please try again.", "Error");
    }
    
    isRegistering.value = false;
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
}
.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
