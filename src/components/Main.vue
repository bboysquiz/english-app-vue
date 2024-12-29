
<template>
    <div class="main-container">
        <div v-show="loading" class="loader-container">
            <div class="spinner"></div>
        </div>
            <button class="main_logout-button">logout</button>
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
            <div class="word-statistic">
                <div class="word-rating word-stats">
                    <img src="../assets/word-rating.svg" class="word-rating-img" alt="word-rating">
                    <span class="word-rating-text word-stats-text">{{ wordRating }}</span>
                </div>
                <div class="word-correct word-stats">
                    <img src="../assets/word-correct.svg" class="word-correct-img" alt="word-correct">
                    <span class="word-correct-text word-stats-text">{{ wordCorrect }}</span>
                </div>
                <div class="word-incorrect word-stats">
                    <img src="../assets/word-incorrect.svg" class="word-incorrect-img" alt="word-incorrect">
                    <span class="word-incorrect-text word-stats-text">{{ wordIncorrect }}</span>
                </div>
            </div>
            <input type="text" class="input" v-model="inputValue" placeholder="Input a translation" ref="translateInput" @keydown.enter="checkTranslation" autofocus>
            <button v-if="!isAnswered" class="button" @click="checkTranslation()">Enter</button>
            <div v-else-if="isAccess" class="access">{{ translation }}</div>
            <div v-else class="incorrect">{{ translation }}</div>
            

            <button class="next" @click="nextWord()">Next</button>
    </div>
</template>
<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const loading = ref(false);

const id = ref(-1)
const word = ref('')
const translation = ref('')
const isAnswered = ref(false)
const inputValue = ref('')
const isAccess = ref(true)

const recentWords = ref([]);

const points = ref(0);
const correctWords = ref(0);
const incorrectWords = ref(0);

const translateInput = ref(null)

const wordRating = ref(0)
const wordCorrect = ref(0)
const wordIncorrect = ref(0)

const nextWord = () => {
    word.value = ''
    fetchWord()
    isAnswered.value = false
    inputValue.value = ''
    translateInput.value?.focus()
}
const fetchWord = () => {
    loading.value = true;
    const exclude = recentWords.value.join(',');
    axios
        .get(`/api/dictionary/random`, {
            params: {
                exclude,
            },
        })
        .then((res) => {
            if (res.data && res.data.word) {
                id.value = res.data.id
                word.value = res.data.word;
                translation.value = res.data.translation;
                wordRating.value = res.data.rating;
                wordCorrect.value = res.data.correct_answer;
                wordIncorrect.value = res.data.incorrect_answer;
            }

            recentWords.value.push(res.data.word);
            if (recentWords.value.length > 5) {
                recentWords.value.shift(); // Удаляем старые записи, оставляя только последние 5
            }
        })
        .catch((error) => {
            console.error('Ошибка запроса:', error);
        });
    loading.value = false;
};
const fetchStats = () => {
    axios
        .get(`/api/users/points`)
        .then((res) => {
            if(res) {
                points.value = res.data.points
            }
        })
    axios
        .get(`/api/users/correct_words`)
        .then((res) => {
            if(res) {
                correctWords.value = res.data.correct_words
            }
        })
    axios
        .get(`/api/users/incorrect_words`)
        .then((res) => {
            if(res) {
                incorrectWords.value = res.data.incorrect_words
            }
        })
}

const checkTranslation = async () => {
    if (isAnswered.value) {
        nextWord();
        return;
    }
    loading.value = true;

    // Подготовка строк
    const input = inputValue.value.trim().toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/й/g, 'и');

    const preparedTranslation = translation.value.trim().toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/й/g, 'и');

    // Сравнение
    if (input === preparedTranslation) {
        isAccess.value = true;
        correctWords.value += 1;
        points.value += 1;
        wordRating.value += 1;
        wordCorrect.value += 1;

        await axios.put(`/api/users/points`, {
            username: 'Squiz',
            points: points.value,
        });
        await axios.put(`/api/users/correct_words`, {
            username: 'Squiz',
            correctWords: correctWords.value,
        });
        await axios.put(`/api/dictionary/rating`, {
            id: id.value,
            rating: wordRating.value,
            correctPoint: wordCorrect.value,
            incorrectPoint: wordIncorrect.value,
        });
    } else {
        isAccess.value = false;
        incorrectWords.value += 1;
        points.value -= 1;
        wordRating.value -= 1;
        wordIncorrect.value += 1;

        await axios.put(`/api/users/points`, {
            username: 'Squiz',
            points: points.value,
        });
        await axios.put(`/api/users/incorrect_words`, {
            username: 'Squiz',
            incorrectWords: incorrectWords.value,
        });
        await axios.put(`/api/dictionary/rating`, {
            id: id.value,
            rating: wordRating.value,
            correctPoint: wordCorrect.value,
            incorrectPoint: wordIncorrect.value,
        });
    }

    isAnswered.value = !isAnswered.value;
    loading.value = false;
};

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
.word-statistic {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 30px;
}
.word-stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.word-stats-text {
    width: 100%;
    text-align: center;
    color: #fff;
}
.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5); /* Optional: for dimming effect */
    z-index: 99999;
    position: fixed;
    top: 0;
    left: 0;
}
.spinner {
    border: 8px solid rgba(255, 255, 255, 0.2);
    border-top: 8px solid #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>