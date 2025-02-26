<template>
    <div class="main-container">
        <div v-show="loading" class="loader-container">
            <div class="spinner"></div>
        </div>
        <div class="language-switcher-container">
            <div class="switcher">
                <div class="switcher-option" :class="{ active: currentLanguage === 'ru' }"
                    @click="switchLanguage('ru')">
                    RU
                </div>
                <div class="switcher-option" :class="{ active: currentLanguage === 'en' }"
                    @click="switchLanguage('en')">
                    EN
                </div>
                <div class="switcher-indicator" ref="indicator"></div>
            </div>
        </div>
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
            {{ displayedWord }}
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
        <input type="text" class="input" v-model="inputValue" placeholder="Input a translation" ref="translateInput"
            @keydown.enter="checkTranslation" autofocus>
        <button v-if="!isAnswered" class="button" @click="checkTranslation()">Enter</button>
        <div v-else-if="isAccess" class="access">{{ correctAnswer }}</div>
        <div v-else class="incorrect">{{ correctAnswer }}</div>


        <button class="next" @click="nextWord()">Next</button>
    </div>
</template>
<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
import router from '../router';
import gsap from 'gsap';

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

const currentLanguage = ref('ru');
const indicator = ref(null);

const wordRating = ref(0)
const wordCorrect = ref(0)
const wordIncorrect = ref(0)

const username = ref('');
const userId = ref('')

// Вычисляемое свойство для отображаемого слова
const displayedWord = computed(() => {
  // Если выбран режим en — показываем английское слово,
  // если ru — показываем русский перевод
  return currentLanguage.value === 'en' ? word.value : translation.value;
})

// Вычисляемое свойство для корректного ответа
const correctAnswer = computed(() => {
  // Если режим en — ожидается русский ответ (translation),
  // если ru — ожидается английский (word)
  return currentLanguage.value === 'en' ? translation.value : word.value;
})

const switchLanguage = (lang) => {
  if (lang === currentLanguage.value) return;
  currentLanguage.value = lang;
  const targetLeft = lang === 'ru' ? '0%' : '50%';
  gsap.to(indicator.value, { duration: 0.3, left: targetLeft });
  nextWord()
};

const fetchUser = async () => {
    try {
        const res = await axios.get(`/api/users/me`, { withCredentials: true });
        username.value = res.data.user.username;
        userId.value = res.data.user.userId;
        console.log('Current user:', res.data.user);
    } catch (error) {
        console.log(error.response.status)
        if (error.response.status === 401) {
            router.push('/login')
        }
        if (error.response.status === 403) {
            router.push('/login')
        }
        console.error('Error fetching user:', error.response?.data?.message || error.message);
    }
};

const nextWord = async () => {
    word.value = ''
    await fetchWord()
    isAnswered.value = false
    inputValue.value = ''
    translateInput.value?.focus()
}
const fetchWord = async () => {
    loading.value = true;
    const exclude = recentWords.value.join(',');
    try {
        // Передаем дополнительные параметры: source_language и target_language
        const res = await axios.get(`/api/dictionary/random`, {
            params: {
                userId: userId.value,
                exclude,
                // Если currentLanguage === 'en', то ищем статистику для пары en→ru,
                // иначе для пары ru→en.
                source_language: currentLanguage.value === 'en' ? 'en' : 'ru',
                target_language: currentLanguage.value === 'en' ? 'ru' : 'en'
            },
            withCredentials: true,
        });
        
        if (res.data && res.data.word) {
            id.value = res.data.id;
            word.value = res.data.word;
            translation.value = res.data.translation;
            // Эти поля берутся из строки статистики, выбранной в запросе
            wordRating.value = res.data.rating;
            // В API могут называться либо correct_answer / incorrect_answer,
            // либо correct_answers / incorrect_answers – нужно, чтобы совпадали с беком
            wordCorrect.value = res.data.correct_answers;
            wordIncorrect.value = res.data.incorrect_answers;
        }

        recentWords.value.push(res.data.word);
        if (recentWords.value.length > 5) {
            recentWords.value.shift(); // оставляем только последние 5 записей
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
    loading.value = false;
};
const fetchStats = async () => {
    try {
        console.log(username.value); // Убедитесь, что здесь выводится корректное значение
        const pointsResponse = await axios.get(`/api/users/points`, {
            params: { userId: userId.value }, // Передаём имя пользователя в query параметрах
            withCredentials: true, // Добавляем cookies
        });
        points.value = pointsResponse.data.points;

        const correctWordsResponse = await axios.get(`/api/users/correct_words`, {
            params: { userId: userId.value },
            withCredentials: true,
        });
        correctWords.value = correctWordsResponse.data.correct_words;

        const incorrectWordsResponse = await axios.get(`/api/users/incorrect_words`, {
            params: { userId: userId.value },
            withCredentials: true,
        });
        incorrectWords.value = incorrectWordsResponse.data.incorrect_words;
    } catch (error) {
        console.error('Error fetching stats:', error.response?.data?.message || error.message);
    }
};

const checkTranslation = async () => {
    if (isAnswered.value) {
        nextWord();
        return;
    }
    loading.value = true;

    // Подготовка строки для сравнения
    const input = inputValue.value.trim().toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/й/g, 'и');

    const expected = correctAnswer.value.trim().toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/й/g, 'и');

    if (input === expected) {
        isAccess.value = true;
        correctWords.value += 1;
        points.value += 1;
        wordRating.value += 1;
        wordCorrect.value += 1;

        await axios.put(`/api/users/points`, {
            userId: userId.value,
            points: points.value,
        });
        await axios.put(`/api/users/correct_words`, {
            userId: userId.value,
            correctWords: correctWords.value,
        });
        // При обновлении рейтинга передаем также параметры языковой пары:
        await axios.put(`/api/dictionary/rating`, {
            id: id.value,
            rating: wordRating.value,
            correctPoint: wordCorrect.value,
            incorrectPoint: wordIncorrect.value,
            // Если currentLanguage === 'en', то обновляем статистику для пары en→ru,
            // иначе для пары ru→en.
            source_language: currentLanguage.value === 'en' ? 'en' : 'ru',
            target_language: currentLanguage.value === 'en' ? 'ru' : 'en',
            userId: userId.value,
        });
    } else {
        isAccess.value = false;
        incorrectWords.value += 1;
        points.value -= 1;
        wordRating.value -= 1;
        wordIncorrect.value += 1;

        await axios.put(`/api/users/points`, {
            userId: userId.value,
            points: points.value,
        });
        await axios.put(`/api/users/incorrect_words`, {
            userId: userId.value,
            incorrectWords: incorrectWords.value,
        });
        await axios.put(`/api/dictionary/rating`, {
            id: id.value,
            rating: wordRating.value,
            correctPoint: wordCorrect.value,
            incorrectPoint: wordIncorrect.value,
            source_language: currentLanguage.value === 'en' ? 'en' : 'ru',
            target_language: currentLanguage.value === 'en' ? 'ru' : 'en',
            userId: userId.value,
        });
    }

    isAnswered.value = !isAnswered.value;
    loading.value = false;
};

onMounted(async () => {
    await fetchUser()
    await fetchWord();
    await fetchStats();
    gsap.set(indicator.value, { left: '0%' });
})
</script>
<style scoped>
.main-container {
    width: 100vw;
    padding-right: 3vw;
    padding-left: 3vw;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding-top: 7vh;
    box-sizing: border-box;
}
.language-switcher-container {
    width: 120px;
    margin-bottom: 20px;
  }
  .switcher {
    position: relative;
    display: flex;
    background: #ccc;
    border-radius: 20px;
    overflow: hidden;
  }
  .switcher-option {
    width: 50%;
    text-align: center;
    padding: 8px 0;
    cursor: pointer;
    z-index: 1;
    font-weight: bold;
    color: #000;
  }
  .switcher-option.active {
    color: #fff;
  }
  .switcher-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: #2D33DB;
    border-radius: 20px;
    z-index: 0;
  }

.incorrect {
    background-color: red;
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
    align-items: center;
    font-size: 34px;
    margin-top: 3vh;
    margin-bottom: 3vh;
    margin-top: 12vh;
    margin-bottom: 12vh;
}

.access {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: green;
    border-radius: 7px;
    font-size: 20px;
}

.next {
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: 20px;
    background-color: #D0D6EB;
    color: #000;
    align-items: center;
    margin-top: 2vh;
    height: 7vh;
}

.button {
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: 28px;
    background-color: #2D33DB;
    color: #fff;
    align-items: center;
    margin-top: 2vh;
    height: 7vh;
}

.input {
    width: 100%;
    border-radius: 30px;
    background: linear-gradient(rgba(3, 3, 31, 1), rgba(6, 6, 37, 0.7), rgba(9, 9, 44, 0));
    border: none;
    outline: none;
    padding-left: 20px;
    color: #fff;
    font-size: 20px;
    height: 10vh;
}

.input::placeholder {
    color: #c1c1c1;
}

.stats-img {
    width: 25px;
}

.stats-number {
    color: #fff;
}

.stats {
    display: flex;
    justify-content: space-between;
    width: 35vw;
}

.word-statistic {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 3vh;
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
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5);
    /* Optional: for dimming effect */
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