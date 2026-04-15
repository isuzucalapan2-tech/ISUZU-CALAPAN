<template>
	<div :class="themeClass" class="min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">
		<div class="absolute top-0 left-0 w-full z-0 opacity-10 pointer-events-none">
			<svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
				<path d="M0 15 H280 L330 45 H500" stroke="#cc0000" stroke-width="1" />
			</svg>
		</div>

		<main class="flex-1 relative z-10 overflow-auto">
			<div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 sm:space-y-10 lg:space-y-16">
				
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-200 pb-2">
					<div>
						<h1 :class="['text-2xl sm:text-4xl font-black text-neutral-950 isuzu-font uppercase tracking-tighter flex items-center gap-3', textClass]">
							<span class="w-1.5 h-8 sm:h-10 bg-red-600"></span>
							Meet the <span class="text-red-600">Team</span>
						</h1>
						<p :class="['text-[9px] sm:text-[11px] uppercase tracking-[0.4em] ml-4 sm:ml-5 mt-1', subTextClass]">Powered by ISUZU Calapan</p>
					</div>
				</div>

				<section class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
					
					<div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
						<div v-for="member in leftSideTeam" :key="member.name" 
							:class="[cardClass, 'rounded-xl p-6 flex flex-col items-center border border-neutral-100 bg-neutral-50/50']">
							<img :src="member.photo" :alt="member.name" class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border border-neutral-200 mb-5 p-1 bg-white" />
							
							<h2 class="text-base font-bold text-neutral-950 text-center leading-tight">{{ member.name }}</h2>
							
							<div class="mt-2 mb-4 bg-neutral-100 text-neutral-700 px-3 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider text-center border border-neutral-200">
								{{ member.role }}
							</div>
							
							<p class="text-center text-neutral-600 text-sm leading-relaxed">{{ member.bio }}</p>
						</div>
					</div>

					<div class="lg:col-span-1">
						<div v-if="projectManager" 
							:class="[cardClass, 'h-full rounded-xl p-8 flex flex-col items-center justify-center border-2 border-red-600/20 bg-white relative']">
							
							<img :src="projectManager.photo" :alt="projectManager.name" 
								class="w-32 h-32 sm:w-36 sm:h-36 rounded-4xl object-cover border-4 border-neutral-100 mb-6 p-1.5 bg-white" />
							
							<h2 class="text-2xl font-extrabold text-neutral-950 text-center mb-1.5 leading-tight">{{ projectManager.name }}</h2>
							
							<div class="bg-red-600 text-white px-5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] mb-7">
								{{ projectManager.role }}
							</div>
							
							<div class="w-16 h-px bg-neutral-200 mb-7"></div>
							
							<p class="text-center text-neutral-700 text-base leading-relaxed px-2 font-medium">
								{{ projectManager.bio }}
							</p>
						</div>
					</div>

				</section>
			</div>
		</main>

		<div class="absolute bottom-0 left-0 w-full z-0 opacity-10 pointer-events-none transform rotate-180">
			<svg viewBox="0 0 500 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
				<path d="M0 45 H170 L220 15 H500" stroke="#cc0000" stroke-width="1" />
			</svg>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const team = ref([
  {
    name: 'Arnold Z. Adeva',
    role: 'Lead Developer',
    photo: '/Team/arnold.jpg',
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
    photo: '/Team/ansel.jpg',
    bio: 'Ansel specializes in backend development and quality assurance, keeping the server and database reliable.'
  }
])

// Filter data for the specific layout
const leftSideTeam = computed(() => {
	return team.value.filter(member => member.name !== 'Dominic Medrano');
});

const projectManager = computed(() => {
	return team.value.find(member => member.name === 'Dominic Medrano');
});

// Theme and card classes (Simplified for modern flat look)
const isDarkMode = computed(() => {
    if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains('dark');
    }
    return false;
});

// Light theme is now cleaner (bg-white/bg-neutral-50), dark theme uses neutral-950
const themeClass = computed(() => isDarkMode.value ? 'text-neutral-100 bg-neutral-950' : 'bg-white text-neutral-900');
const cardClass = computed(() => isDarkMode.value ? 'text-neutral-100 border-neutral-800 bg-neutral-900' : 'bg-white text-neutral-900 border border-neutral-200');
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-neutral-950');
const subTextClass = computed(() => isDarkMode.value ? 'text-neutral-400' : 'text-neutral-500');
</script>

<style scoped>
.isuzu-font {
  font-family: 'IsuzuFont', 'Montserrat', 'Arial Black', Arial, sans-serif;
}
</style>