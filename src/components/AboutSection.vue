<template>
  <section id="about" class="about-section">
    <div class="container">
      <h2 class="section-title">Chi sono</h2>
      <div class="about-layout">
        <div class="about-profile">
          <img src="https://placehold.co/160x160/5856d6/fff?text=Foto" alt="Profilo" class="profile-img" />
          <h3 class="profile-name">Tuo Nome</h3>
          <p class="profile-role">Web Developer</p>
        </div>
        <div class="about-content">
          <p>
            Sviluppo siti web moderni per aziende e professionisti.<br>
            Amo creare soluzioni rapide, eleganti e su misura, curando performance e accessibilità.
          </p>
          <p>
            <strong>Competenze:</strong>
            UI Design, UX, HTML, CSS/SCSS, JavaScript/TypeScript, Vue, React, Three.js, performance e SEO.
          </p>
          <div class="tech-stack">
            <span class="stack-item">Vue.js</span>
            <span class="stack-item">Nuxt</span>
            <span class="stack-item">React</span>
            <span class="stack-item">Three.js</span>
            <span class="stack-item">Tailwind CSS</span>
            <span class="stack-item">Node.js</span>
            <span class="stack-item">SEO</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Potrai personalizzare bio, skills ecc.
</script>

<style scoped>
.about-section {
  background: #fff;
  padding: 5rem 0 3rem;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.5rem;
}
.about-layout {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.about-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
  margin-bottom: 1.5rem;
}
.profile-img {
  border-radius: 50%;
  width: 160px;
  height: 160px;
  object-fit: cover;
  object-position: center;
  margin-bottom: 1.2rem;
}
.profile-name {
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}
.profile-role {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}
.about-content {
  flex: 2 1 260px;
  font-size: 1.08rem;
  color: #32304a;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.tech-stack {
  margin-top: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.stack-item {
  background: #f3f2fd;
  color: #5856d6;
  font-weight: 600;
  border-radius: 18px;
  padding: 0.38rem 1.15rem;
  font-size: 0.97rem;
}
@media (max-width: 700px) {
  .about-layout {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  .about-content {
    font-size: 1rem;
    text-align: center;
  }
  .tech-stack {
    justify-content: center;
  }
}
</style>
