document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    const questionNumberEl = document.getElementById('question-number');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progressBar = document.getElementById('progress-bar');
    
    const resultDisplay = document.getElementById('result-display');
    
    // モーダル関連のDOM要素
    const modalContainer = document.getElementById('modal-container');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');

    // 診断の状態
    let currentQuestionIndex = 0;
    let scores = new Array(typesData.length).fill(0);
    const totalQuestions = questionsData.length;

    // イベントリスナーの設定
    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', restartQuiz);
    optionsContainer.addEventListener('click', handleOptionClick);
    resultDisplay.addEventListener('click', handleResultCardClick);
    modalCloseBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            closeModal();
        }
    });

    // 診断開始処理
    function startQuiz() {
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        displayQuestion();
    }

    // 質問表示処理
    function displayQuestion() {
        const question = questionsData[currentQuestionIndex];
        questionNumberEl.textContent = `質問 ${currentQuestionIndex + 1}/${totalQuestions}`;
        questionTextEl.textContent = question.text;
        updateProgressBar();
    }
    
    function updateProgressBar() {
        const progress = (currentQuestionIndex / totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // 回答選択処理
    function handleOptionClick(event) {
        if (!event.target.classList.contains('option-btn')) return;

        const selectedValue = parseInt(event.target.dataset.value, 10);
        calculateScore(selectedValue);
        
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            displayQuestion();
        } else {
            showResult();
        }
    }
    
    function calculateScore(selectedValue) {
        const questionScoring = questionsData[currentQuestionIndex].scoring;
        const multipliers = { 5: 1, 4: 0.4, 3: 0, 2: -0.4, 1: -1 };
        const multiplier = multipliers[selectedValue];

        questionScoring.forEach(rule => {
            const typeIndex = rule.type - 1;
            scores[typeIndex] += rule.val * multiplier;
        });
    }

    // 結果表示処理
    function showResult() {
        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        const finalResults = getFinalResults();
        
        if (finalResults.length === 0) {
            displayIndeterminateResult();
            return;
        }

        resultDisplay.innerHTML = '';
        const categories = ['動物', '自然', '役割と原型', '行動と状態', '道具と象徴'];
        categories.forEach(category => {
            const type = finalResults.find(r => r.category === category);
            if (type) {
                const card = createResultCard(type);
                resultDisplay.appendChild(card);
            }
        });
    }

    function getFinalResults() {
        let isAllNeutral = scores.every(score => score === 0);
        if (isAllNeutral) return [];

        const results = [];
        const categories = ['動物', '自然', '役割と原型', '行動と状態', '道具と象徴'];

        categories.forEach(category => {
            let topType = null;
            let maxScore = -Infinity;

            typesData.forEach((type, index) => {
                if (type.category === category) {
                    if (scores[index] > maxScore) {
                        maxScore = scores[index];
                        topType = type;
                    }
                }
            });
            results.push(topType);
        });
        
        return results.filter(r => r !== null);
    }

    // 結果カードクリック時の処理
    function handleResultCardClick(event) {
        const card = event.target.closest('.result-card');
        if (!card) return;

        const typeId = parseInt(card.dataset.typeId, 10);
        const typeData = typesData.find(t => t.id === typeId);

        if (typeData) {
            openModal(typeData);
        }
    }

    // モーダルを開く
    function openModal(typeData) {
        modalBody.innerHTML = `
            <h2 style="color:${typeData.color}">${typeData.name}</h2>
            ${typeData.detail}
        `;
        modalContainer.classList.remove('hidden');
    }

    // モーダルを閉じる
    function closeModal() {
        modalContainer.classList.add('hidden');
    }

    function createResultCard(type) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.borderColor = type.color;
        card.dataset.typeId = type.id; // typeIdをデータ属性として保持
        
        const title = document.createElement('h3');
        title.textContent = `${type.name}`;

        const description = document.createElement('p');
        description.textContent = type.description;
        
        card.appendChild(title);
        card.appendChild(description);
        
        return card;
    }

    function displayIndeterminateResult() {
        resultDisplay.innerHTML = `
            <h2>診断結果を算出できませんでした。</h2>
            <p style="text-align: left; line-height: 1.8;">
                あなたの回答は、非常に中立的なものが多かったようです。<br>
                66Personalitiesは、あなたの心の「傾向」を探ることで、より深い自己理解を促すツールです。<br><br>
                もしよろしければ、少しだけ自分の心に正直になって、「どちらかといえば、こっちかな？」という感覚を大切にしながら、もう一度診断にトライしてみませんか。<br>
                新しい自分を発見する、面白い旅になるかもしれません。
            </p>
        `;
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        scores.fill(0);
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        updateProgressBar();
    }
});