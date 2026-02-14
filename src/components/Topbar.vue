<template>
  <nav class="bg-neutral-900 text-white">
    <div class="max-w-full mx-auto px-4">
      <div class="flex justify-between items-center h-16">

        <!-- Logo / Brand -->
        <div class="text-xl font-extrabold text-red-600 tracking-widest isuzu-font">
          ISUZU
        </div>

        <!-- Desktop Menu (centered) -->
        <div class="hidden md:flex flex-1 justify-center space-x-8">
          <router-link
            to="/admin/dashboard"
            class="nav-link"
            active-class="nav-link-active"
          >
            Dashboard
          </router-link>

          <router-link
            to="/admin/user-management"
            class="nav-link"
            active-class="nav-link-active"
          >
            User Management
          </router-link>

          <!-- <router-link
            to="/admin/approve"
            class="nav-link"
            active-class="nav-link-active"
          >
            Approve
          </router-link> -->

          <router-link
            to="/admin/inventory"
            class="nav-link"
            active-class="nav-link-active"
          >
            Inventory
          </router-link>

          <router-link
            to="/admin/sa-rotation"
            class="nav-link"
            active-class="nav-link-active"
          >
            Retail Order
          </router-link>

          <router-link
            to="/admin/settings"
            class="nav-link"
            active-class="nav-link-active"
          >
            Settings
          </router-link>
        </div>

        <!-- Right side -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- profile / logout -->
        </div>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden text-2xl text-white"
          @click="isOpen = !isOpen"
        >
          ☰
        </button>

      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden bg-neutral-800 px-4 pb-4">
      <router-link
        to="/admin/dashboard"
        class="block py-2 nav-link"
        active-class="nav-link-active"
        @click="isOpen = false"
      >Dashboard</router-link>

      <router-link
        to="/admin/user-management"
        class="block py-2 nav-link"
        active-class="nav-link-active"
        @click="isOpen = false"
      >User Management</router-link>

      <!-- <router-link
        to="/admin/approve"
        class="block py-2 nav-link"
        active-class="nav-link-active"
        @click="isOpen = false"
      >Approve</router-link> -->

      <router-link
        to="/admin/inventory"
        class="block py-2 nav-link"
        active-class="nav-link-active"
        @click="isOpen = false"
      >Inventory</router-link>

      <router-link
        to="/admin/settings"
        class="block py-2 nav-link"
        active-class="nav-link-active"
        @click="isOpen = false"
      >Settings</router-link>
    </div>

  </nav>
</template>

<script setup>
import { ref } from "vue";
const isOpen = ref(false);
</script>

<style scoped>
/* default link */
.nav-link {
  position: relative;
  padding: 0.25rem 0;
  font-weight: 500;
  transition: all 0.25s ease;
}

/* hover effect */
.nav-link:hover {
  color: #d4d4d4;
}

/* ACTIVE / SELECTED */
.nav-link-active {
  color: #ef4444; /* red-500 */
  font-weight: 700;
}

/* underline bar animation */
.nav-link-active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 3px;
  background-color: #ef4444;
  border-radius: 9999px;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.7);
}

@font-face {
  font-family: 'IsuzuFont';
  src: url('@/assets/usuzi/usuzi.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.isuzu-font {
  font-family: 'IsuzuFont', sans-serif;
}
</style>
