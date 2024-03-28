
<template>
    <div class="main-container">
        <div class="stats">
            <div class="points">
                <img src="../assets/star.png" alt="star" class="stats-img points-img">
                <div class="points-number stats-number">{{ points }}</div>
            </div>
            <div class="correct-words">
                <img src="../assets/correct.png" alt="correct" class="stats-img correct-words-img">
                <div class="correct-words-number stats-number">{{ correctWords }}</div>
            </div>
            <div class="incorrect-words">
                <img src="../assets/incorrect.png" alt="incorrect" class="stats-img incorrect-words-img">
                <div class="incorrect-words-number stats-number">{{ incorrectWords }}</div>
            </div>
        </div>
        <div class="word">
            {{ word }}
        </div>
        <input type="text" class="input" v-model="inputValue" placeholder="Input a translation">
        <button v-if="!isAnswered" class="button" @click="checkTranslation()">Enter</button>
        <div v-else-if="isAccess" class="access">{{ translation }}</div>
        <div v-else class="incorrect">{{ translation }}</div>
        

        <button class="next" @click="nextWord()">Next</button>
    </div>
</template>
<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const word = ref('')
const translation = ref('')
const isAnswered = ref(false)
const inputValue = ref('')
const isAccess = ref(true)

const points = ref(1);
const correctWords = ref(2);
const incorrectWords = ref(3);

const nextWord = () => {
    fetchWord()
    isAnswered.value = false
    inputValue.value = ''
}
const fetchWord = () => {
    axios
        .get(`http://localhost:3000/api/dictionary/random`)
        .then((res) => {
            if (res.data && res.data.word) {
                word.value = res.data.word;
                translation.value = res.data.translation;
            }
        })
        .catch((error) => {
            console.error('Ошибка запроса:', error);
        });
};
const fetchStats = () => {
    axios
        .get(`http://localhost:3000/api/users/points`)
        .then((res) => {
            if(res) {
                points.value = res.data.points
            }
        })
    axios
        .get(`http://localhost:3000/api/users/correct_words`)
        .then((res) => {
            if(res) {
                correctWords.value = res.data.correct_words
            }
        })
    axios
        .get(`http://localhost:3000/api/users/incorrect_words`)
        .then((res) => {
            if(res) {
                incorrectWords.value = res.data.incorrect_words
            }
        })
}

const checkTranslation = async () => {

    const input = inputValue.value.trim().toLowerCase();
    
    if (input === translation.value.toLowerCase()) {
        isAccess.value = true
        correctWords.value += 1
        points.value += 1
        axios
            .put(`http://localhost:3000/api/users/points`, {
                username: 'Squiz',
                points: points.value,
            })
            .then(() => {
                fetchStats();
            })
        axios
            .put(`http://localhost:3000/api/users/correct_words`, {
                username: 'Squiz',
                correctWords: correctWords.value,
            })
            .then(() => {
                fetchStats();
            })
       
    }else {
        isAccess.value = false
        incorrectWords.value += 1
        points.value -= 1
        axios
            .put(`http://localhost:3000/api/users/points`, {
                username: 'Squiz',
                points: points.value,
            })
            .then(() => {
                fetchStats();
            })
        axios
            .put(`http://localhost:3000/api/users/incorrect_words`, {
                username: 'Squiz',
                incorrectWords: incorrectWords.value,
            })
            .then(() => {
                fetchStats();
            })
    }
    isAnswered.value = !isAnswered.value
}
onMounted(() => {
    fetchWord();
    fetchStats();
})
</script>
<style scoped>
.main-container {
    width: 480px;
    padding-right: 23px;
    padding-left: 23px;
    padding-top: 10%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.incorrect {
    background-color: red;
    height: 82px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    border-radius: 7px;
    font-size: 20px;
}
.word {
    width: 100%;
    justify-content: center;
    display: flex;
    color: #D0D6EB;
    height: 34vh;
    align-items: center;
    font-size: 34px;
}
.access {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: green;
    height: 7.8vh;
    border-radius: 7px;
    font-size: 20px;
}
.next {
    width: 100%;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    font-size: 20px;
    background-color: #D0D6EB;
    color: #000;
    height: 7.8vh;
    align-items: center;
}
.button {
    width: 100%;
    height: 7.8vh;
    margin-top: 11px;
    display: flex;
    justify-content: center;
    font-size: 28px;
    background-color: #2D33DB;
    color: #fff;
    align-items: center;
}
.input {
    width: 100%;
    height: 7.8vh;
    border-radius: 30px;
    background: linear-gradient(rgba(3, 3, 31, 1), rgba(6, 6, 37, 0.7), rgba(9, 9, 44, 0));
    border: none;
    outline: none;
    padding-left: 20px;
    color: #fff;
    margin-top: 5vh;
    font-size: 20px;
}
.input::placeholder {
    color: #c1c1c1;
}
.stats-img {
    width: 25px;
    height: 25px;
}
.stats-number {
    color: #fff;
}
.stats {
    display: flex;
    justify-content: space-between;
    width: 300px;
}
</style>