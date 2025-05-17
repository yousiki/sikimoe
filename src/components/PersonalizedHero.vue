<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { VueTypedJs } from 'vue3-typed-ts';

const strings = ref<Array<string>>([]);
const fontLoaded = ref(false);

// Function to load the JiangxiZhuokai font
const loadCustomFont = async () => {
  try {
    const font = new FontFace(
      'JiangxiZhuokai',
      'url("/fonts/JiangxiZhuokai.ttf") format("truetype")'
    );

    // Wait for the font to be loaded
    await font.load();

    // Add the font to the document
    document.fonts.add(font);

    // Mark the font as loaded
    fontLoaded.value = true;
    console.log('JiangxiZhuokai font loaded successfully');
  } catch (error) {
    console.error('Failed to load JiangxiZhuokai font:', error);
    // Don't mark as loaded on error - we won't show the poem text at all
    console.log('Font loading failed, poem will not be displayed');
  }
};

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

// Function to fetch poem from API
const fetchPoem = async () => {
  try {
    const response = await axios.get('https://v2.jinrishici.com/one.json');
    const poemData = response.data;

    if (poemData.status === 'success') {
      strings.value = [
        poemData.data.content,
        `「${poemData.data.origin.title}」 - ${poemData.data.origin.author}`,
      ];
    } else {
      // Fallback in case API fails
      strings.value = ['山重水复疑无路，柳暗花明又一村', '宋代 · 陆游'];
    }
  } catch (error) {
    console.error('Failed to fetch poem:', error);
    // Fallback in case of error
    strings.value = ['山重水复疑无路，柳暗花明又一村', '宋代 · 陆游'];
  }
};

onMounted(async () => {
  // Select a random image when the component loads
  selectRandomWelcomeCover();

  // Start loading the font and fetching the poem in parallel
  await Promise.all([loadCustomFont(), fetchPoem()]);
});
</script>

<template>
  <section class="w-full flex flex-col gap-8 mb-16 sm:mb-24">
    <div class="hero hero__bg">
      <div
        class="hero__content h-[40vh] flex flex-col justify-center items-center"
      >
        <VueTypedJs
          v-if="fontLoaded"
          :strings="strings"
          :type-speed="50"
          :start-delay="300"
          :back-delay="2000"
          :loop="true"
          :show-cursor="true"
          :smartBackspace="true"
          class="poem-text"
        >
          <span class="typing"></span>
        </VueTypedJs>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Remove the @font-face declaration since we're loading it dynamically via JS */

.poem-text {
  font-family: 'JiangxiZhuokai', serif;
  font-size: 1.75rem;
  line-height: 1.75;
  text-align: center;
}

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
