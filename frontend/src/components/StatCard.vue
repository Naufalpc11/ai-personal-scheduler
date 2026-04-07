<script setup>
defineProps({
    icon: String,
    label: String,
    value: [String, Number],
    highlight: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <div class="stat-card" :class="{ highlight }">
        <div class="stat-icon">{{ icon }}</div>
        <div>
            <h3>{{ label }}</h3>
            <p class="stat-number">{{ value }}</p>
        </div>
    </div>
</template>

<style scoped>
.stat-card {
    background: white;
    padding: 20px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.stat-card.highlight {
    background-color: #4A70A9;
    color: white;
}

.stat-card.highlight h3 {
    color: #e0e0e0;
}

.stat-icon {
    font-size: 2rem;
}

.stat-card h3 {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: bold;
}
</style>