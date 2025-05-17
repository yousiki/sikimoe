<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { VueTypedJs } from 'vue3-typed-ts';

const strings = ref<Array<string>>([]);

// Function to randomly select a welcome cover image
const selectRandomWelcomeCover = () => {
  // Number of welcome cover images available (update this as you add more images)
  const numImages = 9; // We have 9 images (0-8)
  const randomIndex = Math.floor(Math.random() * numImages);
  const imagePath = `/images/welcome-covers-resized/welcome-cover-${randomIndex}.jpg`;

  // Set the CSS variable for the background image
  document.documentElement.style.setProperty(
    '--welcome-cover-image',
    `url('${imagePath}')`
  );
};

onMounted(() => {
  // Select a random image when the component loads
  selectRandomWelcomeCover();

  // Using jinrishici API instead of hitokoto
  axios
    .get('https://v2.jinrishici.com/one.json')
    .then((res: any) => {
      const poemData = res.data;
      if (poemData.status === 'success') {
        strings.value = [
          poemData.data.content,
          `《${poemData.data.origin.title}》 - ${poemData.data.origin.author}`,
        ];
      } else {
        // Fallback in case API fails
        strings.value = ['山重水复疑无路，柳暗花明又一村', '宋代 · 陆游'];
      }
      console.log(strings);
    })
    .catch((error) => {
      console.error('Failed to fetch poem:', error);
      // Fallback in case of error
      strings.value = ['山重水复疑无路，柳暗花明又一村', '宋代 · 陆游'];
    });
});
</script>

<template>
  <section class="w-full flex flex-col gap-8 mb-16 sm:mb-24">
    <div class="hero hero__bg">
      <div
        class="hero__content h-[40vh] flex flex-col justify-center items-center"
      >
        <VueTypedJs
          :strings="strings"
          :type-speed="50"
          :start-delay="300"
          :loop="true"
          :show-cursor="true"
        >
          <span class="typing"></span>
        </VueTypedJs>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero__bg {
  position: relative;
}

.hero__bg::before {
  z-index: -1;
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  background-image: var(
    --welcome-cover-image,
    url('/images/welcome-covers-resized/welcome-cover-0.jpg')
  );
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.5;
}
</style>
