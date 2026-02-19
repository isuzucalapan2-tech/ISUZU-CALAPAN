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
                @blur="checkUsernameExists(username)"
                @input="debouncedCheckUsername(username)"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                  usernameError ? 'border-red-500' : '',
                  !usernameError && username && !usernameChecking ? 'border-green-500' : ''
                ]"
              />
              <p v-if="usernameChecking" class="text-blue-600 text-xs mt-1">
                Checking availability...
              </p>
              <p v-else-if="usernameError" class="text-red-600 text-xs mt-1">
                {{ usernameError }}
              </p>
              <p v-else-if="username && !isUsernameTaken" class="text-green-600 text-xs mt-1">
                Username is available
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                required
                @blur="checkEmailExists(email)"
                @input="debouncedCheckEmail(email)"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                  emailError ? 'border-red-500' : '',
                  !emailError && email && !emailChecking ? 'border-green-500' : ''
                ]"
              />
              <p v-if="emailChecking" class="text-blue-600 text-xs mt-1">
                Checking availability...
              </p>
              <p v-else-if="emailError" class="text-red-600 text-xs mt-1">
                {{ emailError }}
              </p>
              <p v-else-if="email && !isEmailTaken" class="text-green-600 text-xs mt-1">
                Email is available
              </p>
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

          <!-- REGISTER BUTTON -->

          <button
            type="submit"
            :disabled="isRegistering || isUsernameTaken || isEmailTaken || usernameChecking || emailChecking"
            class="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isRegistering" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ isRegistering ? 'Registering...' : 'Register' }}
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
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";


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
  box-shadow: 0 0 0 2px #2563eb;
}
</style>
