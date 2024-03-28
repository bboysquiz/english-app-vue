
<template>
    <div class="dictionary-container">
        <ul class="dictionary-ul">
            <li class="dictionary-li" v-for="item in dictionary" :key="item.id">
                <div class="word">{{ item.word }}</div>
                <div class="translation">{{ item.translation }}</div>
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
import { onMounted, ref } from 'vue'

const dictionary = ref([])
const wordValue = ref('')
const translationValue = ref('')

const deletePair = async (id) => {
    await axios
        .delete(`http://localhost:3000/api/dictionary/${id}`)
        .then((res) => {
            console.log(res)
        })
    await axios
        .get('http://localhost:3000/api/dictionary/')
        .then((res) => {
            dictionary.value = res.data
        })
        .catch((error) => {
            console.error('Ошибка при получении количества пар:', error);
        });
}

const addPair = async () => {
    const word = wordValue.value.trim().toLowerCase();
    const translation = translationValue.value.trim().toLowerCase();
    if (word !== '' && translation !== '') {
        await axios.post(`http://localhost:3000/api/dictionary`, {
            word: word,
            translation: translation
        })
            .then((res) => {
                console.log(res)
            })
        await axios
            .get('http://localhost:3000/api/dictionary/')
            .then((res) => {
                console.log(res)
                dictionary.value.push({ word: word, translation: translation })
                wordValue.value = ''
                translationValue.value = ''
            })
            .catch((error) => {
                console.error('Ошибка при получении количества пар:', error);
            });
    }
}
onMounted(() => {
    axios
        .get('http://localhost:3000/api/dictionary/')
        .then((res) => {
            dictionary.value = res.data
        })
        .catch((error) => {
            console.error('Ошибка при получении количества пар:', error);
        });
})
</script>
<style scoped>
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
</style>