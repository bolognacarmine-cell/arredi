<template>
  <section id="hero" class="hero-section">
    <div class="container">
      <h1 class="hero-title">La tua presenza online su misura</h1>
      <p class="hero-subtitle">
        Sviluppo siti web, landing page &amp; esperienze digitali per il tuo business.<br />
        Professionalità, creatività e attenzione alle performance.
      </p>
      <div class="hero-ctas">
        <button class="cta primary">Richiedi preventivo</button>
        <button class="cta secondary">Vedi progetti</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Potrai aggiungere props/funzioni per animazioni, scroll, ecc.
</script>

<style scoped>
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  background: var(--hero-bg, #f7f7f7);
}
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.hero-subtitle {
  color: #555;
  font-size: 1.25rem;
  margin-bottom: 2rem;
}
.hero-ctas {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.cta {
  padding: 0.75rem 2rem;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s;
}
.cta.primary {
  background: #5856d6;
  color: white;
}
.cta.primary:hover {
  background: #423ec2;
}
.cta.secondary {
  background: white;
  color: #5856d6;
  border: 2px solid #5856d6;
}
.cta.secondary:hover {
  background: #f0f0ff;
}
@media (max-width: 600px) {
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
  .hero-ctas {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
