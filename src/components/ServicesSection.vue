<template>
  <section id="services" class="services-section">
    <div class="container">
      <h2 class="section-title">Servizi</h2>
      <p class="section-subtitle">Soluzioni digitali su misura per la tua attività</p>
      <div class="services-grid">
        <ServiceCard 
          icon="mdi-web" 
          title="Sviluppo siti aziendali" 
          desc="Realizzazione siti professionali, responsive e ottimizzati per le performance." />
        <ServiceCard 
          icon="mdi-bullhorn" 
          title="Landing page" 
          desc="Landing efficaci per campagne marketing, lead e conversioni su misura." />
        <ServiceCard 
          icon="mdi-rocket-launch" 
          title="Ottimizzazione & SEO" 
          desc="Miglioro le performance e il posizionamento sui motori di ricerca." />
        <ServiceCard 
          icon="mdi-cube-scan" 
          title="Esperienze 3D/WebGL" 
          desc="Animazioni, esperienze immersive e presentazioni 3D per il web." />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ServiceCard from './ServiceCard.vue'
</script>

<style scoped>
.services-section {
  background: white;
  padding: 5rem 0 3rem;
}
.container {
  max-width: 1000px;
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
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 2rem;
}
</style>
