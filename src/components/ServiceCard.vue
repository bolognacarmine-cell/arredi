<template>
  <div class="service-card">
    <div class="icon-wrap">
      <span v-if="icon" :class="['service-icon', icon]" aria-hidden="true"></span>
    </div>
    <h3 class="service-title">{{ title }}</h3>
    <p class="service-desc">{{ desc }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  desc: string
}

defineProps<Props>()
</script>

<style scoped>
.service-card {
  background: #f7f7f7;
  border-radius: 18px;
  padding: 2rem 1.25rem 1.75rem;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.service-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 8px 32px 0 rgba(88,86,214,0.12);
}
.icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  height: 50px;
}
.service-icon {
  font-size: 2.25rem;
  color: #5856d6;
  /* inserisci qui la logica per gestire le icone oppure usa un'icona svg custom */
}
.service-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}
.service-desc {
  font-size: 1rem;
  color: #555;
}
</style>
