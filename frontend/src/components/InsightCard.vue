<script setup>
defineProps({
    insights: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['apply'])
</script>

<template>
    <section class="card insight-section">
        <h3>💡 Rekomendasi AI</h3>
        <ul class="insight-list">
            <li v-for="(item, index) in insights" :key="index" v-html="item" />
        </ul>
        <button class="btn-outline-ai" @click="emit('apply')">Terapkan Rekomendasi</button>
    </section>
</template>

<style scoped>
.card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.card h3 {
    margin-bottom: 20px;
    color: #000;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.insight-list {
    list-style: none;
    margin-bottom: 20px;
}

.insight-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 15px;
    color: #555;
    line-height: 1.5;
}

.insight-list li::before {
    content: '✨';
    position: absolute;
    left: 0;
    font-size: 0.9rem;
}

.btn-outline-ai {
    background: transparent;
    border: 1px solid #4A70A9;
    color: #4A70A9;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
    transition: 0.3s;
}

.btn-outline-ai:hover {
    background: #4A70A9;
    color: white;
}
</style>