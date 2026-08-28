<template>
  <section id="contact" class="contact-section">
    <div class="container">
      <h2 class="section-title">Contatti</h2>
      <div class="contact-layout">
        <div class="contact-info">
          <h3>Contatti diretti</h3>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:tuamail@email.com">tuamail@email.com</a></li>
            <li><strong>Tel:</strong> <a href="tel:+390123456789">+39 0123 456789</a></li>
            <li><strong>LinkedIn:</strong> <a href="#" target="_blank">Il tuo profilo</a></li>
          </ul>
        </div>
        <form class="contact-form" @submit.prevent="submit">
          <label>Nome<input v-model="name" required /></label>
          <label>Email<input type="email" v-model="email" required /></label>
          <label>Messaggio<textarea v-model="message" rows="4" required /></label>
          <button class="cta primary" type="submit">Invia richiesta</button>
          <p v-if="success" class="success-msg">Messaggio inviato! Ti ricontatterò al più presto.</p>
        </form>
        <div class="contact-map">
          <!-- Placeholder mappa embed -->
          <iframe title="Mappa" width="100%" height="180" frameborder="0" style="border:0"
            src="https://maps.google.com/maps?q=Milano&t=&z=13&ie=UTF8&iwloc=&output=embed"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const name = ref('')
const email = ref('')
const message = ref('')
const success = ref(false)

function submit() {
  success.value = true
  setTimeout(() => success.value = false, 4000)
  name.value = ''
  email.value = ''
  message.value = ''
}
</script>
<style scoped>
.contact-section {
  background: #f7f7fa;
  padding: 5rem 0 3rem;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.2rem;
}
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.5rem;
}
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 2.5rem;
  align-items: start;
}
.contact-info {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 14px 0 rgba(0,0,0,0.05);
  padding: 1.8rem 1.1rem 1.1rem;
  font-size: 1rem;
}
.contact-info ul {
  margin: 0.5rem 0 0 0;
  padding: 0;
  list-style: none;
}
.contact-info a {
  color: #5856d6;
  text-decoration: underline;
}
.contact-form {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 14px 0 rgba(0,0,0,0.05);
  padding: 2rem 1.4rem 1.1rem; 
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}
.contact-form label {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  gap: 0.3rem;
  color: #23234a;
}
.contact-form input,
.contact-form textarea {
  border-radius: 10px;
  border: 1.2px solid #d6d6ec;
  padding: 0.6rem 0.85rem;
  font-size: 1rem;
  outline: none;
  margin-top: 2px;
  background: #f6f6fd;
  transition: border-color 0.18s;
}
.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #423ec2;
}
.cta.primary {
  background: #5856d6;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.cta.primary:hover {
  background: #423ec2;
}
.success-msg {
  color: #30c759;
  font-size: 1.1rem;
  margin-top: 0.7rem;
  font-weight: 600;
}
.contact-map {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 14px 0 rgba(0,0,0,0.05);
  background: #fff;
}
@media (max-width: 950px) {
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 2.2rem;
  }
  .contact-map {
    height: 200px;
  }
}
</style>
