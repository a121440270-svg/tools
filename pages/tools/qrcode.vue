<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">二维码生成器</h1>
    <div class="flex flex-col space-y-4">
      <input v-model="inputText" type="text" placeholder="输入文本或URL" class="p-2 border rounded" />
      <button @click="generateQR" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">生成二维码</button>
      <canvas ref="qrCanvas" class="w-64 h-64 mx-auto"></canvas>
      <a v-if="qrDataUrl" :href="qrDataUrl" download="qrcode.png" class="text-blue-500 hover:underline">下载二维码</a>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  data() {
    return {
      inputText: '',
      qrDataUrl: ''
    };
  },
  methods: {
    async generateQR() {
      if (this.inputText) {
        try {
          this.qrDataUrl = await QRCode.toDataURL(this.inputText, {
            width: 256,
            margin: 2
          });
          const canvas = this.$refs.qrCanvas;
          await QRCode.toCanvas(canvas, this.inputText, {
            width: 256,
            margin: 2
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
};
</script>

<style scoped>
/* 响应式样式 */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>