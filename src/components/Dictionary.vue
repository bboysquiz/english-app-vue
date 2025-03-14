<template>
    <div class="dictionary-container">
        <div class="search-wrapper">
            <input type="text" class="search-input" v-model="searchQuery" placeholder="Искать слово" />
            <img src="../assets/search.svg" class="search-icon" alt="search" />
        </div>
        <ul class="dictionary-ul">
            <li class="dictionary-li" v-for="item in filteredDictionary" :key="item.id"
                @click="handleWordClick(item, $event)">
                <div class="word">{{ item.word }}</div>
                <div class="translation">{{ item.translation }}</div>
            </li>
        </ul>
       
        <div class="dictionary__open-add-word-menu">
            <button class="open-add-word-menu__button" @click="openAddMenu">
                <div class="open-add-word-menu__content">
                    <img src="../assets/add.svg" alt="add" class="open-add-word-menu__img">
                    <span>Добавить слово</span>
                </div>
            </button>
        </div>
        <!-- Контекстное меню -->
         <div class="dictionary__context-menu-overlay" ref="contextMenu" v-if="showContextMenu">         
            <div class="dictionary__context-menu">
                <button class="dictionary__context-button edit-button"
                    @click="() => { openEditMenu(selectedItem.value); hideContextMenu(); }">
                    <img src="../assets/edit.svg" alt="edit" class="edit-icon">
                    <span>Редактировать</span>
                </button>
                <button class="dictionary__context-button delete-button"
                    @click="() => { deletePair(); hideContextMenu(); }">
                    <img src="../assets/delete.svg" alt="delete" class="delete-icon">
                    <span>Удалить</span>
                </button>
                <button class="dictionary__context-button cancel-button" @click="hideContextMenu">
                    <img src="../assets/cancel.svg" alt="cancel" class="cancel-icon">
                    <span>Отмена</span>
                </button>
            </div>
        </div>

        <div class="dictionary__edit-menu" v-show="showAddMenu">
            <input type="text" class="edit-input" v-model="wordValue" placeholder="Еnglish word" />
            <input type="text" class="edit-input" v-model="translationValue" placeholder="Translation" />
            <div class="edit-menu__buttons">
                <button class="edit-cancel edit-menu__button" @click="closeAddMenu">
                    <div class="edit-menu__button-content">
                        <img src="../assets/cancel.svg" alt="cancel" class="edit-menu__cancel-img">
                        <span>Отмена</span>
                    </div>
                </button>
                <button @click="addPair" class="edit-accept edit-menu__button" :style="wordValue.length === 0 || translationValue.length === 0 ? 'background-color: #414147; cursor: not-allowed;' : ''">
                    <div class="edit-menu__button-content">
                        <img src="../assets/accept.svg" alt="accept" :style="wordValue.length === 0 || translationValue.length === 0 ? 'color: #868686;' : ''" class="edit-menu__cancel-img">
                        <span :style="wordValue.length === 0 || translationValue.length === 0 ? 'color: #868686;' : ''">Готово</span>
                    </div>
                </button>
            </div>
        </div>

        <!-- Меню редактирования -->
        <div class="dictionary__edit-menu" v-show="showEditMenu">
            <input class="edit-input" v-model="editWordValue" placeholder="Edit word" />
            <input class="edit-input" v-model="editTranslationValue" placeholder="Edit translation" />
            <div class="edit-menu__buttons">
                <button class="edit-cancel edit-menu__button" @click="closeEditMenu">
                    <div class="edit-menu__button-content">
                        <img src="../assets/cancel.svg" alt="cancel" class="edit-menu__cancel-img">
                        <span>Отмена</span>
                    </div>
                </button>
                <button @click="handleSaveEdit" class="edit-accept edit-menu__button" :style="editWordValue.length === 0 || editTranslationValue.length === 0 ? 'background-color: #414147; cursor: not-allowed;' : ''">
                    <div class="edit-menu__button-content">
                        <img src="../assets/accept.svg" alt="accept" :style="editWordValue.length === 0 || editTranslationValue.length === 0 ? 'color: #868686;' : ''" class="edit-menu__cancel-img">
                        <span :style="editWordValue.length === 0 || editTranslationValue.length === 0 ? 'color: #868686;' : ''">Готово</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
import router from '../router';

const dictionary = ref([])
const wordValue = ref('')
const translationValue = ref('')
const searchQuery = ref('')

// Для добавления 
const showAddMenu = ref(false)

// Для редактирования
const showEditMenu = ref(false)
const editWordValue = ref('')
const editTranslationValue = ref('')

// Для контекстного меню
const contextMenu = ref(null)
const showContextMenu = ref(false)
const selectedItem = ref(null)

const username = ref('');
const userId = ref('');

const fetchUser = async () => {
    try {
        const res = await axios.get(`/api/users/me`, { withCredentials: true });
        username.value = res.data.username;
        userId.value = res.data.user.userId;
    } catch (error) {
        if (error.response.status === 401 || error.response.status === 403) {
            router.push('/login')
        }
        console.error('Error fetching user:', error.response?.data?.message || error.message);
    }
};

const deletePair = async () => {
    try {
        await axios.delete(`/api/dictionary/${selectedItem.value.id}`, {
            params: { userId: userId.value },
            withCredentials: true,
        });
        dictionary.value = dictionary.value.filter(item => item.id !== selectedItem.value.id);
    } catch (error) {
        console.error('Error deleting pair:', error);
    }
};

const addPair = async () => {
    if (!wordValue.value || !translationValue.value) return
    const word = wordValue.value.trim().toLowerCase();
    const translation = translationValue.value.trim().toLowerCase();
    console.log(word, translation)
    if (userId.value && word && translation) {
        try {
            const response = await axios.post(`/api/dictionary`, { userId: userId.value, word, translation });
            dictionary.value.push({ ...response.data, isEditing: false });
            wordValue.value = '';
            translationValue.value = '';
            showAddMenu.value = false
        } catch (error) {
            console.error('Error adding pair:', error);
        }
    }
};

const saveEdit = async (item) => {
    console.log('save')
    try {
        await axios.put(`/api/dictionary/pair`, {
            id: item.id,
            word: item.word.trim().toLowerCase(),
            translation: item.translation.trim().toLowerCase(),
            userId: userId.value,
        });
        // Убираем флаг редактирования, если он где-то использовался
        item.isEditing = false;
    } catch (error) {
        console.error('Error saving edit:', error);
    }
};

// Открыть меню редактирования
const openAddMenu = () => {
    showAddMenu.value = true;
};

// Закрыть меню редактирования
const closeAddMenu = () => {
    showAddMenu.value = false;
};

// Открыть меню редактирования
const openEditMenu = () => {
    if (!selectedItem.value) return;
   
    // Подставляем значения в инпуты
    editWordValue.value = selectedItem.value.word;
    editTranslationValue.value = selectedItem.value.translation;
    console.log(editWordValue.value, editTranslationValue.value)
    // Показываем меню
    showEditMenu.value = true;
};

// Закрыть меню редактирования
const closeEditMenu = () => {
    showEditMenu.value = false;
    selectedItem.value = null;
};

// Нажатие "Готово" при редактировании
const handleSaveEdit = async () => {
    // Берём текущие значения инпутов и записываем в selectedItem
    console.log(selectedItem.value, editWordValue.value.length, editTranslationValue.value.length)
    if (!selectedItem.value || editWordValue.value.length === 0 || editTranslationValue.value.length === 0) return;
    selectedItem.value.word = editWordValue.value;
    selectedItem.value.translation = editTranslationValue.value;

    // Сохраняем на бэкенд
    await saveEdit(selectedItem.value);
    // Закрываем меню
    closeEditMenu();
};

const filteredDictionary = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return dictionary.value;
    return dictionary.value.filter(item =>
        item.word.toLowerCase().includes(query) || item.translation.toLowerCase().includes(query)
    );
});

const handleWordClick = (item, event) => {
    selectedItem.value = item;
    console.log(selectedItem.value)
    showContextMenu.value = true;
    event.stopPropagation();
};

const hideContextMenu = () => {
    showContextMenu.value = false;
};

onMounted(async () => {
    await fetchUser();
    try {
        const response = await axios.get('/api/dictionary/', {
            params: { userId: userId.value }
        });
        dictionary.value = response.data.data.map(item => ({ ...item, isEditing: false }));
    } catch (error) {
        console.error('Error fetching dictionary:', error);
    }

    // Глобальный обработчик клика для скрытия контекстного меню
    document.addEventListener('click', (e) => {
        if (contextMenu.value && !contextMenu.value.contains(e.target)) {
            hideContextMenu();
        }
    });
});
</script>

<style scoped>
.dictionary__open-add-word-menu {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 80px);
    position: absolute;
    bottom: 180px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
}
.open-add-word-menu__button {
    width: 100%;
    height: 120px;
    background-color: #248FE7;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    border-radius: 30px;
}
.open-add-word-menu__content {
    width: 367px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 40px;
    color: #fff;
}
.edit-input {
    margin-right: 5px;
    font-size: 30px;
    width: calc(100% - 80px);
    color: #fff;
    height: 120px;
    border: none;
    background-color: #414147;
    padding-left: 45px;
    border-radius: 30px;
    margin-top: 20px;
    box-sizing: border-box;
    outline: none;
}
.edit-input::placeholder {
    color: #868686;
}
.edit-menu__buttons {
    display: flex;
    width: calc(100% - 80px);
    justify-content: space-between;
    align-items: center;
    height: 120px;
    margin-top: 30px;
}
.edit-menu__button {
    height: 120px;
    width: calc(50% - 20px);
    background-color: #248FE7;
    font-size: 40px;
    border: none;
    color: #fff;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
}
.edit-menu__button::placeholder {
    color: #868686;
}
.edit-menu__button-content {
    display: flex;
    justify-content: space-between;
    width: 189px;
    align-items: center;
}

.edit-button,
.save-button {
    color: #fff;
    font-size: 30px;
    border: none;
    cursor: pointer;
}
.cancel-button > span {
    font-size: 30px;
}

.dictionary-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 0vh 3vw;
    height: 66vh;
    margin-top: 14.31vh;
    overflow-y: auto;
    margin-bottom: 15vh;
}

.dictionary-li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    padding-bottom: 30px;
    margin-top: 30px;
    border-bottom: 1px solid #4E4E55;
    padding-left: 28px;
    box-sizing: border-box;
}

.dictionary-li::before {
    content: '';
    top: 0;
    left: 0;
    width: 10px;
    height: calc(100% - 30px);
    position: absolute;
    background-color: #248FE7;
    border-radius: 30px;
}

.dictionary-ul {
    overflow-y: scroll;
    padding-left: 0;
}

.word {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 50%;
    font-size: 30px;
    color: #fff;
}

.translation {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 50%;
    font-size: 30px;
    color: #fff;
}

.delete-button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
}
.delete-button > span {
    color: #F24E4E;
}

.input-word {
    width: 38%;
    border-radius: 20px;
    background: linear-gradient(rgb(5, 5, 72), rgba(7, 7, 88, 0.7), rgba(8, 8, 255, 0));
    border: 1px solid #2e2e2e;
    outline: none;
    padding-left: 20px;
    color: #fff;
    font-size: 20px;
    height: 7vh;
}

.input-translation {
    width: 38%;
    border-radius: 20px;
    background: linear-gradient(rgb(5, 5, 72), rgba(7, 7, 88, 0.7), rgba(8, 8, 255, 0));
    border: 1px solid #2e2e2e;
    outline: none;
    padding-left: 20px;
    color: #fff;
    font-size: 20px;
    height: 7vh;
}

.button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    border: none;
    outline: none;
    width: 10%;
    height: 7vh;
}

.dictionary__new-word-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 15vh;
    width: 94%;
}

/* Расположение контекстного меню всегда внизу */
.dictionary__context-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #333;
    z-index: 1000;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
}

.search-wrapper {
    display: flex;
    justify-content: flex-start;
    position: fixed;
    top: 9.2vh;
    left: 7vw;
    width: 90%;
    height: 4vh;
}

.search-input {
    width: calc(100% - 40px - 12.31vw);
    font-size: 30px;
    border: none;
    border-radius: 5px;
    background-color: #414147;
    border-radius: 20px;
    position: relative;
    height: 4.46vh;
    padding-left: 85px;
    color: #fff;
    box-sizing: border-box;
    outline: none;
}

.search-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 29px;
}

.search-input::placeholder {
    color: #868686;
}

.dictionary__context-button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    height: 95px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 60px;
    border-bottom: 1px solid #4E4E55;
}
.dictionary__context-button:last-child {
    border-bottom: none;
}
.dictionary__context-button > img {
    margin-right: 30px;
}
.dictionary__edit-menu {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20px 0px;
    box-sizing: border-box;
    background-color: #2E2E31;
    z-index: 2;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
.dictionary__context-menu-overlay {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .7);
}

@media screen and (max-width: 767px){
    .dictionary-container {
        padding: 0 17px;
        margin-top: 109px;
        height: 73vh;
    }
    .search-wrapper {
        height: 40px;
        top: 50px;
        left: 17px;
    }
    .search-input {
        height: 40px;
        border-radius: 8.7px;
        padding-left: 36px;
        font-size: 13px;
    }
    .search-icon {
        width: 11px;
        height: 10px;
        left: 12px;
    }
    .word {
        font-size: 13px;
    }
    .translation {
        font-size: 13px;
    }
    .dictionary-li::before {
        width: 4px;
        height: calc(100% - 13px);
    }
    .dictionary-li:first-child {
        margin-top: 0;
    }
    .dictionary-li {
        padding-bottom: 13px;
        padding-left: 16px;
    }
    .dictionary-ul {
        margin-top: 0;
    }
    .dictionary__open-add-word-menu {
        width: calc(100% - 34px);
        bottom: 76px;
        height: 52px;
    }
    .open-add-word-menu__button {
        height: 100%;
    }
    .open-add-word-menu__content {
        font-size: 17px;
        width: 159px;
    }
    .open-add-word-menu__img {
        width: 13px;
        height: 13px;
    }
    .dictionary__context-button {
        height: 41px;
        font-size: 13px;
        padding-left: 26px;
    }
    .cancel-button > span {
        font-size: 13px;
    }
    .edit-icon {
        width: 11px;
        height: 11px;
    }
    .delete-icon {
        width: 11px;
        height: 11px;
    }
    .cancel-icon {
        width: 11px;
        height: 11px;
    }
    .dictionary__context-button > img {
        margin-right: 13px;
    }
    .dictionary__context-menu {
        bottom: 0px;
    }
    .edit-input {
        height: 45px;
        width: calc(100% - 34px);
        border-radius: 13px;
        font-size: 11px;
        padding-left: 20px;
        margin-top: 5px;
    }
    .edit-menu__button {
        height: 52px;
        border-radius: 13px;
        font-size: 17px;
        width: calc(50% - 2px);
    }
    .edit-menu__cancel-img {
        height: 13px;
        width: 13px;
    }
    .edit-menu__button-content {
        width: 92px;
    }
    .dictionary__edit-menu {
        padding: 11px 0 16px 0;
    }
    .edit-menu__buttons {
        margin-top: 5px;
        height: 52px;
        width: calc(100% - 34px);
    }
}
</style>