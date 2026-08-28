<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <!-- Puoi sostituire con il tuo logo o nome -->
          <span class="brand">TuoNome.dev</span>
        </div>
        <nav class="footer-nav">
          <a href="#services">Servizi</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#about">About</a>
          <a href="#contact">Contatti</a>
        </nav>
        <div class="footer-socials">
          <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#5856d6" d="M17 18.998h2v-6c0-2.206-1.795-4-4-4s-4 1.794-4 4v6h2v-6c0-1.103.898-2 2-2s2 .897 2 2v6zM6 9.998c.828 0 1.5-.671 1.5-1.5s-.672-1.5-1.5-1.5-1.5.671-1.5 1.5.672 1.5 1.5 1.5zm1 9h-2v-7h2v7z"/></svg></a>
          <a href="#" aria-label="GitHub"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#5856d6" d="M12 2C6.476 2 2 6.477 2 12c0 4.418 2.868 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.236-.009-.868-.014-1.703-2.782.604-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.389-1.984 1.029-2.682-.103-.254-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.025a9.564 9.564 0 0 1 2.5-.336c.849.004 1.705.115 2.5.336 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.394.1 2.647.641.698 1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.921.678 1.857 0 1.34-.012 2.421-.012 2.751 0 .268.18.578.688.48C19.135 20.163 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg></a>
        </div>
      </div>
      <div class="footer-copy">
        &copy; {{ new Date().getFullYear() }} TuoNome.dev — P.IVA 1234567890
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
// Personalizza link, social, P.IVA, branding secondo necessità
</script>
<style scoped>
.app-footer {
  background: #f0f1fa;
  color: #32304a;
  padding: 2.8rem 0 1.1rem;
  font-size: 1rem;
  margin-top: 3rem;
  border-top: 1.5px solid #ececff;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.2rem;
}
.footer-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}
.footer-brand .brand {
  font-weight: bold;
  font-size: 1.25rem;
  color: #5856d6;
}
.footer-nav {
  display: flex;
  gap: 1.6rem;
}
.footer-nav a {
  color: #5856d6;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.18s;
}
.footer-nav a:hover {
  color: #423ec2;
}
.footer-socials {
  display: flex;
  gap: 1.1rem;
}
.footer-socials a {
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-copy {
  margin-top: 2.1rem;
  text-align: center;
  color: #8886aa;
  font-size: 0.96rem;
}
@media (max-width: 600px) {
  .footer-main {
    flex-direction: column;
    gap: 1.7rem;
    align-items: flex-start;
  }
}
</style>
