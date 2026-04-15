<template>
	<div :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">
		<div class="absolute top-0 left-0 w-full z-0 opacity-5 pointer-events-none">
			<svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
				<path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="2" />
			</svg>
		</div>
		<main class="flex-1 relative z-10 overflow-auto">
			<div class="max-w-full mx-auto p-3 sm:p-4 lg:p-6 xl:p-10 space-y-6 sm:space-y-8 lg:space-y-12">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
					<div>
						<h1 :class="['text-xl sm:text-3xl font-black text-neutral-900 isuzu-font uppercase tracking-tight flex items-center gap-2 sm:gap-3', textClass]">
							<span class="w-2 h-8 sm:h-10 bg-red-600 rounded-full"></span>
							Meet the <span class="text-red-600">Team</span>
						</h1>
						<p :class="['text-[8px] sm:text-[10px] uppercase tracking-[0.3em] ml-3 sm:ml-5', subTextClass]">Get to know the people behind ISUZU Calapan</p>
					</div>
				</div>
				<section>
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
						<div v-for="member in team" :key="member.name" :class="[cardClass, 'rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-all']">
							<img :src="member.photo" :alt="member.name" class="w-24 h-24 rounded-full object-cover border-4 border-red-600 mb-4 shadow-md" />
							<h2 class="text-lg font-bold text-neutral-900">{{ member.name }}</h2>
							<p class="text-red-600 text-xs font-semibold uppercase tracking-widest mb-2">{{ member.role }}</p>
							<p class="text-center text-neutral-600 text-sm">{{ member.bio }}</p>
						</div>
					</div>
				</section>
			</div>
		</main>
		<div class="absolute bottom-0 left-0 w-full z-0 opacity-5 pointer-events-none transform rotate-180">
			<svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
				<path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="2" />
			</svg>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const team = ref([
<<<<<<< Updated upstream
	{
		name: 'Arnold Z. Adeva',
		role: 'Lead Developer',
		photo: 'https://randomuser.me/api/portraits/men/32.jpg',
		bio: 'Arnold leads the team with expertise in full-stack development, ensuring robust and scalable solutions.'
	},
	{
		name: 'Michael Joshua F. Manga',
		role: 'UI/UX Designer | Frontend Developer',
		photo: 'https://randomuser.me/api/portraits/women/44.jpg',
		bio: 'Michael crafts intuitive user interfaces and seamless user experiences, bringing designs to life on the frontend.'
	},
	{
		name: 'Dominic Medrano',
		role: 'Project Manager',
		photo: 'https://randomuser.me/api/portraits/men/21.jpg',
		bio: 'Dominic organizes, coordinates, and drives the team to deliver projects efficiently and on schedule.'
	},
	{
		name: 'Donabel V. Gasco',
		role: 'Backend Engineer | QA Specialist',
		photo: 'https://randomuser.me/api/portraits/women/68.jpg',
		bio: 'Donabel develops and maintains backend systems, and ensures product quality through rigorous testing.'
	},
	{
		name: 'Ansel Phillip C. Laniosa',
		role: 'Backend Engineer | QA Specialist',
		photo: 'https://randomuser.me/api/portraits/men/65.jpg',
		bio: 'Ansel specializes in backend development and quality assurance, keeping the server and database reliable.'
	}
=======
  {
    name: 'Arnold Z. Adeva',
    role: 'Lead Developer',
    photo: '/Team/AZ.jpg',
    bio: 'Arnold leads the team with expertise in full-stack development, ensuring robust and scalable solutions.'
  },
  {
    name: 'Michael Joshua F. Manga',
    role: 'UI/UX Designer | Frontend Developer',
    photo: '/Team/MJM.png',
    bio: 'Michael crafts intuitive user interfaces and seamless user experiences, bringing designs to life on the frontend.'
  },
  {
    name: 'Dominic Medrano',
    role: 'Project Manager',
    photo: '/Team/Sir_Dom.jpg',
    bio: 'Dominic organizes, coordinates, and drives the team to deliver projects efficiently and on schedule.'
  },
  {
    name: 'Donabel V. Gasco',
    role: 'Backend Engineer | QA Specialist',
    photo: '/Team/DV.jpg',
    bio: 'Donabel develops and maintains backend systems, and ensures product quality through rigorous testing.'
  },
  {
    name: 'Ansel Phillip C. Laniosa',
    role: 'Backend Engineer | QA Specialist',
    photo: '/Team/APL.jpg',
    bio: 'Ansel specializes in backend development and quality assurance, keeping the server and database reliable.'
  }
>>>>>>> Stashed changes
])

// Theme and card classes (copied from Dashboard.vue)
const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));
const themeClass = computed(() => isDarkMode.value ? 'text-white bg-neutral-900' : 'bg-gray-50 text-gray-900');
const cardClass = computed(() => isDarkMode.value ? 'text-white border-neutral-700/50 bg-neutral-800 border' : 'bg-white text-gray-900 border border-neutral-200');
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-gray-800');
const subTextClass = computed(() => isDarkMode.value ? 'text-gray-300' : 'text-gray-600');
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', 'Montserrat', 'Arial Black', Arial, sans-serif;
}
</style>
