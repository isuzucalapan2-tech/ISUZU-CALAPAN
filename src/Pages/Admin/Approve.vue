<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen">



    <!-- Topbar -->
    <Topbar />

    <!-- Content -->
    <div class="p-8">

      <h1 :class="textClass" class="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">
        User Approval
      </h1>


      <div :class="cardClass" :style="cardStyle" class="border-2 rounded-xl overflow-hidden border-t-4 border-t-red-600 hover:shadow-xl transition-all duration-300">





        <!-- Users Table -->
        <table class="w-full text-left">
          <thead :class="tableHeaderClass" class="border-b-2 border-red-600">


            <tr>
              <th class="p-3">Username</th>
              <th class="p-3">Email</th>
              <th class="p-3">Role</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            <!-- Pending Users -->
            <tr
              v-for="user in pendingUsers"
              :key="user.id"
              :class="rowHoverClass"
              class="border-b border-gray-300 hover:shadow-md transition-all duration-200"
            >

              <td :class="textClass" class="p-3">{{ user.username || "N/A" }}</td>
              <td :class="textClass" class="p-3">{{ user.email || "N/A" }}</td>


              <!-- Role Selector -->
              <td class="p-3">
                <select
                  v-model="user.selectedRole"
                  class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                >

                  <option disabled value="">Select Role</option>
                  <option>Parts Supervisor</option>
                  <option>Parts Marketing</option>
                  <option>Parts Admin</option>
                  <option>Parts Warehouse</option>
                </select>
              </td>

              <!-- Approve Button -->
              <td class="p-3">
                <button
                  @click="approveUser(user)"
                  class="bg-gray-800 text-white px-4 py-1 rounded hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Approve
                </button>
              </td>

            </tr>

            <!-- No Pending Users -->
            <tr v-if="pendingUsers.length === 0">
              <td colspan="4" :class="subTextClass" class="text-center p-6">
                No pending users
              </td>
            </tr>

          </tbody>
        </table>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Topbar from "../../components/Topbar.vue";


import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../Firebase/Firebase";

const pendingUsers = ref([]);

// ✅ Load Pending Users Only
const loadPendingUsers = () => {
  try {
    const q = query(
      collection(db, "users"),
      where("approved", "==", false)
    );

    // Real-time listener
    onSnapshot(q, (snapshot) => {
      pendingUsers.value = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          username: data.username || "N/A",
          email: data.email || "N/A",
          role: data.role || "",
          approved: data.approved || false,
          selectedRole: ""
        };
      });
    });

  } catch (err) {
    console.error("Firestore error:", err);
  }
};

// ✅ Approve User
const approveUser = async (user) => {
  if (!user.selectedRole) {
    alert("Please select role first");
    return;
  }

  try {
    const userRef = doc(db, "users", user.id);

    await updateDoc(userRef, {
      approved: true,
      role: user.selectedRole
    });

    pendingUsers.value = pendingUsers.value.filter(
      u => u.id !== user.id
    );

  } catch (error) {
    console.error("Error approving user:", error);
  }
};

// Theme application
const applyTheme = (theme) => {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');

  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.add('light');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }
  localStorage.setItem('appTheme', theme);
};

// Theme detection
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark');
});

const themeClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'bg-white text-gray-800'
);

const themeStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#232323' } : {}
);

const cardClass = computed(() =>
  isDarkMode.value ? 'border-gray-600' : 'bg-white border-black'
);

const cardStyle = computed(() =>
  isDarkMode.value ? { backgroundColor: '#2a2a2a' } : {}
);


const tableHeaderClass = computed(() =>
  isDarkMode.value ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
);

const textClass = computed(() =>
  isDarkMode.value ? 'text-white' : 'text-gray-800'
);

const subTextClass = computed(() =>
  isDarkMode.value ? 'text-gray-300' : 'text-gray-500'
);

const rowHoverClass = computed(() =>
  isDarkMode.value ? 'hover:bg-gray-700' : 'hover:bg-red-50'
);

onMounted(() => {
  loadPendingUsers();
});
</script>


<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
