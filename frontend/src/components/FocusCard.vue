<script setup>
defineProps({
    title: String,
    deadline: String,
    status: String
})
</script>

<template>
    <section class="card focus-section">
        <h3>🎯 Fokus Utama Hari Ini</h3>
        <div class="focus-item">
            <div class="task-info">
                <strong>{{ title }}</strong>
                <p>Deadline: {{ deadline }}</p>
            </div>
            <span class="status-badge">{{ status }}</span>
        </div>
    </section>
</template>

<style scoped>
.card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.card h3 {
    margin-bottom: 20px;
    color: #000;
    font-size: 1.2rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.focus-item {
    background: #f9f9fc;
    padding: 15px;
    border-radius: 10px;
    border-left: 4px solid #4A70A9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.task-info strong {
    display: block;
    color: #000;
    margin-bottom: 5px;
}

.task-info p {
    color: #888;
    font-size: 0.85rem;
}

.status-badge {
    background: #8FABD4;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}
</style>