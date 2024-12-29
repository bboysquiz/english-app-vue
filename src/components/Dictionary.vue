<template>
    <div class="dictionary-container">
        <button class="main_logout-button">logout</button>
        <div class="search-wrapper">
            <input
                type="text"
                class="search-input"
                v-model="searchQuery"
                placeholder="Search words..."
            />
        </div>
        <ul class="dictionary-ul">
            <li class="dictionary-li" v-for="item in filteredDictionary" :key="item.id">
                <div v-if="!item.isEditing" class="word">{{ item.word }}</div>
                <input
                    v-else
                    class="edit-input"
                    v-model="item.word"
                    placeholder="Edit word"
                />

                <div v-if="!item.isEditing" class="translation">{{ item.translation }}</div>
                <input
                    v-else
                    class="edit-input"
                    v-model="item.translation"
                    placeholder="Edit translation"
                />

                <button
                    v-if="!item.isEditing"
                    class="edit-button"
                    @click="item.isEditing = true"
                >
                    Edit
                </button>
                <button
                    v-if="item.isEditing"
                    class="save-button"
                    @click="saveEdit(item)"
                >
                    Save
                </button>
                <button class="delete-button" @click="deletePair(item.id)">Delete</button>
            </li>
        </ul>
        <div class="dictionary_new-word-wrapper">
            <input type="text" class="input-word" v-model="wordValue" placeholder="Input english word">
            <input type="text" class="input-translation" v-model="translationValue" placeholder="Input russian word">
            <button class="button" @click="addPair()">Add</button>
        </div>          
    </div>
</template>
<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'

const dictionary = ref([])
const wordValue = ref('')
const translationValue = ref('')
const searchQuery = ref('');

const deletePair = async (id) => {
    try {
        await axios.delete(`/api/dictionary/${id}`);
        dictionary.value = dictionary.value.filter(item => item.id !== id);
    } catch (error) {
        console.error('Error deleting pair:', error);
    }
};

const addPair = async () => {
    const word = wordValue.value.trim().toLowerCase();
    const translation = translationValue.value.trim().toLowerCase();
    if (word && translation) {
        try {
            const response = await axios.post(`/api/dictionary`, { word, translation });
            dictionary.value.push({ ...response.data, isEditing: false });
            wordValue.value = '';
            translationValue.value = '';
        } catch (error) {
            console.error('Error adding pair:', error);
        }
    }
};

const saveEdit = async (item) => {
    try {
        await axios.put(`/api/dictionary/pair`, {
            id: item.id,
            word: item.word.trim().toLowerCase(),
            translation: item.translation.trim().toLowerCase(),
        });
        item.isEditing = false; // Exit edit mode after saving
    } catch (error) {
        console.error('Error saving edit:', error);
    }
};

const filteredDictionary = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return dictionary.value; // Если поле поиска пустое, вернуть весь список
    return dictionary.value.filter(item =>
        item.word.toLowerCase().includes(query) || item.translation.toLowerCase().includes(query)
    );
});

onMounted(async () => {
    try {
        const response = await axios.get('/api/dictionary/');
        dictionary.value = response.data.map(item => ({ ...item, isEditing: false }));
    } catch (error) {
        console.error('Error fetching dictionary:', error);
    }
});
</script>
<style scoped>
.edit-input {
    width: 40%;
    height: 20px;
    margin-right: 5px;
    font-size: 14px;
    padding: 5px;
}
.edit-button, .save-button {
    height: 20px;
    background-color: blue;
    color: white;
    font-size: 10px;
    border: none;
    cursor: pointer;
}
.dictionary-container {
    width: 480px;
    padding-right: 23px;
    padding-left: 23px;
    padding-top: 5vh;
}

.dictionary-li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.dictionary-ul {
    height: 64.3vh;
    overflow-y: scroll;
}
.word {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 50%;
}

.translation {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 50%;
}
.delete-button {
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    background-color: red;
}
.input-word {
    width: 38%;
    height: 7.8vh;
    border-radius: 20px;
    background: linear-gradient(rgb(5, 5, 72), rgba(7, 7, 88, 0.7), rgba(8, 8, 255, 0));
    border: 1px solid #2e2e2e;
    outline: none;
    padding-left: 20px;
    color: #fff;
    font-size: 20px;
}
.input-translation {
    width: 38%;
    height: 7.8vh;
    border-radius: 20px;
    background: linear-gradient(rgb(5, 5, 72), rgba(7, 7, 88, 0.7), rgba(8, 8, 255, 0));
    border: 1px solid #2e2e2e;
    outline: none;
    padding-left: 20px;
    color: #fff;
    font-size: 20px;
}
.button {
    height: 7.8vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    border: none;
    outline: none;
}
.dictionary_new-word-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.search-wrapper {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
}

.search-input {
    width: 100%;
    height: 30px;
    padding: 5px 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
</style>