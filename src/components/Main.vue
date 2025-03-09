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

        <div class="word-container"
            :style="isAnswered && isAccess ? 'background-color: #29513A' : isAnswered && !isAccess ? 'background-color: #6B2525' : ''">
            <div class="word-smile-container">
                <img v-if="!isAnswered" :src="`/src/assets/smiles/question-smiles/smile-${randomSmile}.svg` " alt="smile"
                    class="word-smile-img">
                <img v-else-if="isAnswered && isAccess" :src="`/src/assets/smiles/access-smiles/smile-${randomSmile}.svg`" alt="smile"
                    class="word-smile-img">
                <img v-else :src="`/src/assets/smiles/fail-smiles/smile-${randomSmile}.svg`" alt="smile"
                    class="word-smile-img">
            </div>
            <div class="word">
                {{ displayedWord }}
            </div>

            <textarea type="text" class="input" v-model="inputValue" placeholder="Input a translation"
                ref="translateInput" @keydown.enter="handleButtonClick" 
                :style="isAnswered && isAccess ? 'background-color: #212825;' : isAnswered && !isAccess ? 'background-color: #331212; height: 7.81vh;' : ''" 
                autofocus> </textarea>
            <button v-if="!isAnswered" class="button" ref="checkButton" @click="handleButtonClick">
                <div class="button-content">
                    <img src="../assets/check-icon.svg" alt="check">
                    <span>Проверить</span>
                </div>
            </button>
            <div v-else-if="!isAccess" class="incorrect">{{ correctAnswer }}</div>


            <button v-if="isAnswered" class="next" :style="isAccess ? 'background-color: #4ABA77;' : 'background-color: #F24E4E;'" @click="handleNextClick" ref="nextButton">
                <div class="next-content">
                    <img src="../assets/arrow.svg" alt="arrow" class="next-icon">
                    <div class="next-title">Следующее слово</div>
                </div>
            </button>
            <div class="word-statistic" :style="isAccess && isAnswered ? 'border: 1px solid #305F44;' : !isAccess && isAnswered ? 'border: 1px solid #622020;' : ''">
                <div class="word-statistic-title">Статистика слова</div>
                <div class="word-stats-container">
                    <div class="word-rating word-stats" :style="isAccess && isAnswered ? 'background-color: #33714D;' : !isAccess && isAnswered ? 'background-color: #762B2B;' : ''">
                        <img src="../assets/word-rating.svg" class="word-rating-img" alt="word-rating">
                        <span class="word-rating-text word-stats-text">{{ wordRating }}</span>
                    </div>
                    <div class="word-correct word-stats" :style="isAccess && isAnswered ? 'background-color: #33714D;' : !isAccess && isAnswered ? 'background-color: #762B2B;' : ''">
                        <img src="../assets/word-correct.svg" class="word-correct-img" alt="word-correct">
                        <span class="word-correct-text word-stats-text">{{ wordCorrect }}</span>
                    </div>
                    <div class="word-incorrect word-stats" :style="isAccess && isAnswered ? 'background-color: #33714D;' : !isAccess && isAnswered ? 'background-color: #762B2B;' : ''">
                        <img src="../assets/word-incorrect.svg" class="word-incorrect-img" alt="word-incorrect">
                        <span class="word-incorrect-text word-stats-text">{{ wordIncorrect }}</span>
                    </div>
                </div>
            </div>
        </div>



        <div class="stats">
            <div class="points stats-block">
                <img src="../assets/star.svg" alt="star" class="stats-img points-img">
                <div class="stats-block-text">
                    <div class="points-number stats-number">{{ points }}</div>
                    <div class="stats-title">Ваши очки</div>
                </div>
            </div>
            <div class="correct-words stats-block">
                <img src="../assets/correct.svg" alt="correct" class="stats-img correct-words-img">
                <div class="stats-block-text">
                    <div class="correct-words-number stats-number">{{ correctWords }}</div>
                    <div class="stats-title">Правильных ответов</div>
                </div>
            </div>
            <div class="incorrect-words stats-block">
                <img src="../assets/incorrect.svg" alt="incorrect" class="stats-img incorrect-words-img">
                <div class="stats-block-text">
                    <div class="incorrect-words-number stats-number">{{ incorrectWords }}</div>
                    <div class="stats-title">Неправильных ответов</div>
                </div>
            </div>
        </div>
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

const checkButton = ref(null)
const nextButton = ref(null)

const points = ref(0);
const correctWords = ref(0);
const incorrectWords = ref(0);

const translateInput = ref(null)

const checkingTranslationStatus = ref(false)

const currentLanguage = ref('ru');
const indicator = ref(null);

const wordRating = ref(0)
const wordCorrect = ref(0)
const wordIncorrect = ref(0)
const randomSmile = Math.floor(Math.random() * 12) + 1;

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

const handleButtonClick = async () => {
    if (!checkingTranslationStatus.value) {
        // Анимация: смена цвета на #5BB2FA, затем плавный возврат к исходному (#248FE7)
        checkingTranslationStatus.value = true
        gsap.to(checkButton.value, {
            backgroundColor: "#5BB2FA",
            duration: 0.2,
            onComplete: () => {
                gsap.to(checkButton.value, {
                    backgroundColor: "#248FE7",
                    duration: 0.2
                })
            }
        })
        // Затем выполняем основную логику проверки перевода
        await checkTranslation()
    }
}

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

const handleNextClick = () => {
    gsap.to(checkButton.value, {
        backgroundColor: "#5BB2FA",
        duration: 0.2,
        onComplete: () => {
            gsap.to(checkButton.value, {
                backgroundColor: "#248FE7",
                duration: 0.2
            })
        }
    })
    nextWord()
}

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
        handleNextClick();
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
        gsap.to(checkButton.value, {
            backgroundColor: "#5BB2FA",
            duration: 0.2,
            onComplete: () => {
                gsap.to(checkButton.value, {
                    backgroundColor: "#248FE7",
                    duration: 0.2
                })
            }
        })
    }

    isAnswered.value = !isAnswered.value;
    loading.value = false;
    checkingTranslationStatus.value = false
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
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    box-sizing: border-box;
}

.language-switcher-container {
    width: 100%;
    display: flex;
    margin-top: 8.67vh;
    justify-content: flex-start;
    padding-left: 40px;
}
@media screen and (max-width: 767px) {
    .language-switcher-container {
        margin-top: 70px;
    }
}

.switcher {
    position: relative;
    display: flex;
    background-color: #56565E;
    border-radius: 20px;
    overflow: hidden;
    width: 305px;
    height: 102px;
    font-size: 44px;
    border-radius: 65px;
}
@media screen and (max-width: 768px ) {
    .switcher {
        width: 119px;
        height: 40px;
        font-size: 14.29px;
    }    
}

.switcher-option {
    width: 50%;
    text-align: center;
    cursor: pointer;
    z-index: 1;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #868686;
}

.switcher-option.active {
    color: #fff;
}

.switcher-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(50% - 14px);
    height: calc(100% - 14px);
    background: #248FE7;
    z-index: 0;
    border-radius: 65px;
    border: 7px solid #56565E;
}
@media screen and (max-width: 767px) {
    .switcher-indicator {
        height: 100%;
        border: 2.5px solid #56565E;
        width: 50%;
    }
}

.incorrect {
    background-color: #4ABA77;
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 60px);
    border-radius: 30px;
    font-size: 30px;
    height: 7.03vh;
    margin-top: 0.83vh;
    color: #fff;
}
@media screen and (max-width: 767px) {
    .incorrect {
        height: 45px;
        font-size: 13px;
    }
}

.word {
    width: calc(100% - 60px);
    justify-content: center;
    display: flex;
    color: #fff;
    align-items: center;
    font-size: 55px;
    margin-top: 7.42vh;
    height: 198px;
}
@media screen and (max-width: 767px) {
    .word {
        margin-top: 47px;
        font-size: 18px;
        height: 42px;
        width: calc(100% - 26px);
    }
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
    width: calc(100% - 60px);
    display: flex;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    align-items: center;
    height: 6.69vh;
    margin-top: 0.83vh;
    border: none !important;
    outline: none !important;
    border-radius: 30px;
}
@media screen and (max-width: 767px) {
    .next {
        height: 52px;
        font-size: 17px;
    }
}

.button {
    width: calc(100% - 60px);
    display: flex;
    justify-content: center;
    font-size: 40px;
    background-color: #248FE7;
    color: #fff;
    align-items: center;
    height: 6.69vh;
    margin-top: 0.83vh;
    border-radius: 30px;
    border: none !important;
    outline: none !important;
}

@media screen and (max-width: 767px) {
    .button {
        width: calc(100% - 26px);
        font-size: 17px;
        border-radius: 13px;

    }
}

.input {
    width: calc(100% - 60px);
    border-radius: 30px;
    background: #414147;
    border: none;
    outline: none;
    color: #fff;
    font-size: 20px;
    height: 281px;
    padding: 35px 45px;
    box-sizing: border-box;
    margin-top: 2.79vh;
}

@media screen and (max-width: 767px) {
    .input {
        height: 60px;
        margin-top: 15px;
        border-radius: 13px;
        width: calc(100% - 26px);
        font-size: 13px;
        padding-top: 15px;
        padding-left: 17px;
    }
}

.input::placeholder {
    color: #868686;
}

.stats-img {
    width: 7.24vw;
    height: 3.34vh;
    position: absolute;
    top: 8px;
    right: 8px;
    border: 13px solid #fff;
    border-radius: 100px;
    background-color: #fff;
    box-sizing: border-box;
}
@media screen and (max-width: 767px) {
    .stats-img {
        width: 20px;
        height: 20px;
        border: 5px solid #fff;
    }
}

.stats-number {
    color: #fff;
    font-size: 45px;
}

@media screen and (max-width: 767px) {
    .stats-number {
        font-size: 20px;
    }
}

.stats {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 80px);
    margin-top: 1.67vh;
}
@media screen and (max-width: 767px) {
    .stats {
        width: calc(100% - 34px);
    }
}
.word-statistic {
    width: calc(100% - 60px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    margin-top: 2.23vh;
    padding: 12px 12px 12px 25px;
    box-sizing: border-box;
    border: 1px solid #414147;
    border-radius: 30px;
}

@media screen and (max-width: 767px) {
    .word-statistic {
        width: calc(100% - 26px);
        border-radius: 13px;
    }
}


.word-stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 14.37vw;
    height: 6.64vh;
    background-color: #414147;
    border-radius: 20px;
    box-sizing: border-box;
    padding: 18px 20px 12px 19px;
}
@media screen and (max-width: 767px) {
    .word-stats {
        width: 51px;
        height: 51px;
        border-radius: 9px;
        padding: 6px 9px 6px 8px;
    }
}

.word-stats-text {
    width: 100%;
    text-align: center;
    color: #fff;
    font-size: 35px;
}

@media screen and (max-width: 767px) {
    .word-stats-text {
        font-size: 15px;
    }
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

.word-smile-img {
    width: 93.72px;
    height: 93.72px;
}
@media screen and (max-width: 767px) {
    .word-smile-img {
        width: 33px;
        height: 33px;
    }
}

.word-smile-container {
    box-sizing: border-box;
    width: 209px;
    height: 209px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 20px solid #0A0A0A;
    border-radius: 140px;
    background-color: #fff;
    position: absolute;
    top: 0px;
    transform: translateY(-50%);
}
@media screen and (max-width: 767px) {
    .word-smile-container {
        border: 9px solid #0A0A0A;
        width: 75px;
        height: 75px;
    }
}

.word-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: calc(100vw - 80px);
    background-color: #2E2E31;
    margin-top: 106.5px;
    position: relative;
    padding-bottom: 30px;
    border-radius: 50px;
}
@media screen and (max-width: 767px) {
    .word-container {
        width: calc(100vw - 36px);
        border-radius: 21px;
        margin-top: 49px;
    }
}

.button-content {
    width: 32.729vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media screen and (max-width: 767px) {
    .button-content > img {
        width: 13px;
        height: 13px;
    }
}

.next-content {
    width: 50.2vw;
    display: flex;
    justify-content: space-between;
}

.word-statistic-title {
    color: #fff;
    font-size: 35px;
    width: 10.65vw;
}
@media screen and (max-width: 767px) {
    .word-statistic-title {
        font-size: 15px;
    }
}

.word-stats-container {
    display: flex;
    justify-content: space-between;
    width: 45.53vw;
}
@media screen and (max-width: 767px) {
    .word-stats-container {
        width: 163px;
    }
}

.stats-block-text {
    height: 4.63vh;
    width: 15.82vw;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}
@media screen and (max-width: 767px) {
    .stats-block-text {
        height: 35px;
        width: 57px;
    }
}
.stats-block {
    width: 28.86vw;
    height: 9.65vh;
    border-radius: 35px;
    background-color: #248FE7;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    flex-wrap: wrap;
    padding-left: 25px;
    box-sizing: border-box;
}
@media screen and (max-width: 767px) {
    .stats-block {
        width: 103px;
        height: 75px;
        border-radius: 15px;
        padding-left: 10px;
    }
}
.stats-title {
    font-size: 20px;
    color: #fff;
    width: 100%;
    text-align: left;
    line-height: 20px;
}
@media screen and (max-width: 767px) {
    .stats-title {
        font-size: 9px;
        line-height: 10px;
    }
}

.next-title {
    font-size: 40px;
    color: #fff;
}
@media screen and (max-width: 767px) {
    .next-title {
        font-size: 17px;
    }
    .next-icon {
        height: 13px;
        width: 13px;
    }
    .next-content {
        width: 181px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 21px;
    }
}


@media screen and (max-width: 767px) {
    .word-rating-img {
        width: 11px;
        height: 13px;
    } 
    .word-correct-img {
        width: 12px;
        height: 12px;
    }
    .word-incorrect-img {
        width: 12px;
        height: 13px;
    }
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