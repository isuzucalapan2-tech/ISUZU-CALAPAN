<template>
  <div :class="themeClass" :style="themeStyle" class="min-h-screen">
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
              <th class="p-3">Position</th>
              <th class="p-3">Permission</th>
              <th class="p-3">Actions</th>
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
              
              <td class="p-3">
                <select
                  v-model="user.selectedRole"
                  class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                >
                  <option disabled value="">Select Role</option>
                  <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
                </select>
              </td>
              <td class="p-3">
                <select
                  v-model="user.selectedPosition"
                  class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                >
                  <option disabled value="">Select Position</option>
                  <option v-for="pos in positionOptions" :key="pos" :value="pos">{{ pos }}</option>
                </select>
              </td>
              <td class="p-3">
                <select
                  v-model="user.selectedPermission"
                  class="border border-black px-2 py-1 rounded w-full hover:border-red-600 hover:shadow-sm transition-all duration-200"
                >
                  <option disabled value="">Select Permission</option>
                  <option v-for="perm in permissionOptions" :key="perm" :value="perm">{{ perm }}</option>
                </select>
              </td>
              <td class="p-3 flex gap-2">
                <button
                  @click="approveUser(user)"
                  class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Approve
                </button>
                <button
                  @click="denyUser(user)"
                  class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Deny
                </button>
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


import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "../../Firebase/Firebase";

const pendingUsers = ref([]);
const positionOptions = ref([]);
const roleOptions = ref([]);
const permissionOptions = ref([]);

// Helper function to fetch all position options
const fetchPositionOptions = async () => {
  try {
    const positions = [];
    const docIds = [
      "isuzu$calapan$position201",
      "isuzu$calapan$position202", 
      "isuzu$calapan$position203",
      "isuzu$calapan$position204",
      "isuzu$calapan$position205",
      "isuzu$calapan$position206"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Position_Access", docId));
      if (docRef.exists() && docRef.data().position) {
        positions.push(docRef.data().position);
      }
    }
    positionOptions.value = positions;
  } catch (err) {
    console.error("Error fetching position options:", err);
  }
};

// Helper function to fetch all role options
const fetchRoleOptions = async () => {
  try {
    const roles = [];
    const docIds = [
      "isuzu&calapan&staff103",
      "isuzu&calapan&admin102",
      "isuzu&calapan&master&admin101"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Role_Access", docId));
      if (docRef.exists() && docRef.data().roleName) {
        roles.push(docRef.data().roleName);
      }
    }
    roleOptions.value = roles;
  } catch (err) {
    console.error("Error fetching role options:", err);
  }
};

// Helper function to fetch all permission options
const fetchPermissionOptions = async () => {
  try {
    const permissions = [];
    const docIds = [
      "isuzu#calapan#permission301",
      "isuzu#calapan#permission302",
      "isuzu#calapan#permission303",
      "isuzu#calapan#permission304",
      "isuzu#calapan#permission305"
    ];
    
    for (const docId of docIds) {
      const docRef = await getDoc(doc(db, "Permission_Access", docId));
      if (docRef.exists() && docRef.data().permission) {
        permissions.push(docRef.data().permission);
      }
    }
    permissionOptions.value = permissions;
  } catch (err) {
    console.error("Error fetching permission options:", err);
  }
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

// Helper function to fetch existing roles for a user
const fetchUserRoles = async (userId) => {
  try {
    const roleDoc = await getDoc(doc(db, "Administrator", userId, "Roles", "Default_Roles"));
    if (roleDoc.exists()) {
      return roleDoc.data();
    }
    return null;
  } catch (err) {
    console.error("Error fetching user roles:", err);
    return null;
  }
};



// ✅ Load Pending Users Only
const loadPendingUsers = () => {
  try {
    const q = query(
      collection(db, "Administrator"),
      where("accountStatus", "==", "pending")
    );

    // Real-time listener
    onSnapshot(q, async (snapshot) => {
      const userPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        
        // Fetch role data from subcollection if exists
        const roleData = await fetchUserRoles(docSnap.id);
        
        return {
          id: docSnap.id,
          username: data.username || "N/A",
          email: data.email || "N/A",
          role: data.role || "",
          accountStatus: data.accountStatus || "pending",
          selectedPosition: roleData?.position || "",
          selectedRole: roleData?.role || "",
          selectedPermission: roleData?.permission || "",
          position: roleData?.position || "",
          roleName: roleData?.role || "",
          permission: roleData?.permission || ""
        };

      });
      
      pendingUsers.value = await Promise.all(userPromises);
    });

  } catch (err) {
    console.error("Firestore error:", err);
  }
};


// ✅ Approve User - Approve with selected roles
const approveUser = async (user) => {
  if (!user.selectedPosition || !user.selectedRole || !user.selectedPermission) {
    alert("Please select Position, Role, and Permission before approving");
    return;
  }
  
  try {
    const userRef = doc(db, "Administrator", user.id);

    // Create or update Roles subcollection with selected values
    await setDoc(doc(db, "Administrator", user.id, "Roles", "Default_Roles"), {
      position: user.selectedPosition,
      role: user.selectedRole,
      permission: user.selectedPermission,
      setAt: new Date(),
      updateAt: new Date()
    });

    await updateDoc(userRef, {
      accountStatus: "approved",
      Status: "Active"
    });


    pendingUsers.value = pendingUsers.value.filter(
      u => u.id !== user.id
    );

  } catch (error) {
    console.error("Error approving user:", error);
  }
};


// ❌ Deny User
const denyUser = async (user) => {
  if (!confirm("Are you sure you want to deny this user?")) return;
  
  try {
    const userRef = doc(db, "Administrator", user.id);
    
    await updateDoc(userRef, {
      accountStatus: "denied"
    });

    pendingUsers.value = pendingUsers.value.filter(
      u => u.id !== user.id
    );

  } catch (error) {
    console.error("Error denying user:", error);
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
  fetchPositionOptions();
  fetchRoleOptions();
  fetchPermissionOptions();
});

</script>


<style scoped>
body {
  font-family: 'Inter', sans-serif;
}
</style>
