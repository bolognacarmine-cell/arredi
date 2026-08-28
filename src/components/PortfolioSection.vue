<template>
  <section id="portfolio" class="portfolio-section">
    <div class="container">
      <h2 class="section-title">Portfolio</h2>
      <p class="section-subtitle">Alcuni progetti selezionati</p>
      <div class="portfolio-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :title="project.title"
          :image="project.image"
          :link="project.link"
          :desc="project.desc"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProjectCard from './ProjectCard.vue'

interface Project {
  id: number
  title: string
  image: string
  link: string
  desc: string
}

const projects = ref<Project[]>([
  {
    id: 1,
    title: 'Sito aziendale GreenTech',
    image: 'https://placehold.co/400x280/5856d6/fff?text=GreenTech',
    link: '#',
    desc: 'Sito vetrina per azienda eco-friendly: design minimal, SEO, mobile first.'
  },
  {
    id: 2,
    title: 'Landing Page Fisio',
    image: 'https://placehold.co/400x280/34c759/fff?text=Landing+Fisio',
    link: '#',
    desc: 'Landing ottimizzata per lead generation studio fisioterapico.'
  },
  {
    id: 3,
    title: 'Web App 3D Demo',
    image: 'https://placehold.co/400x280/ff9500/fff?text=3D+Web',
    link: '#',
    desc: 'Demo interattiva 3D per presentazione prodotti con WebGL.'
  },
])
</script>

<style scoped>
.portfolio-section {
  background: #fafaff;
  padding: 5rem 0 3rem;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.section-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 2rem;
}
</style>
