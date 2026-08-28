<template>
  <div class="project-card">
    <a :href="link" target="_blank" rel="noopener" class="project-image-link">
      <img :src="image" :alt="title" class="project-image" />
    </a>
    <div class="project-content">
      <h3 class="project-title">{{ title }}</h3>
      <p class="project-desc">{{ desc }}</p>
      <a :href="link" target="_blank" rel="noopener" class="project-cta">Scopri di più</a>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  image: string
  link: string
  desc: string
}
defineProps<Props>()
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.project-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 6px 28px 0 rgba(88,86,214,0.11);
}
.project-image-link {
  display: block;
}
.project-image {
  width: 100%;
  display: block;
  aspect-ratio: 4/3;
  object-fit: cover;
  object-position: center;
}
.project-content {
  padding: 1rem 1.1rem 1.35rem;
}
.project-title {
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #222;
}
.project-desc {
  color: #555;
  margin-bottom: 1rem;
  font-size: 1rem;
}
.project-cta {
  color: #5856d6;
  font-weight: 600;
  padding: 0.4rem 1.1rem;
  border-radius: 30px;
  font-size: 0.96rem;
  background: #f6f5ff;
  text-decoration: none;
  transition: background 0.2s;
}
.project-cta:hover {
  background: #e3e2fc;
}
</style>
