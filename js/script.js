document.addEventListener('DOMContentLoaded', () => {
    // Модальное окно бирж
    const setupModal = (openId, closeId, modalId) => {
        const openBtn = document.getElementById(openId);
        const closeBtn = document.getElementById(closeId);
        const modal = document.getElementById(modalId);

        if (!openBtn || !closeBtn || !modal) return;

        openBtn.addEventListener('click', () => modal.classList.add('active'));
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    };

    setupModal('open-exchanges-modal', 'close-exchanges-modal', 'exchanges-modal');
    setupModal('open-tonkeeper-modal', 'close-tonkeeper-modal', 'tonkeeper-modal');

    // Обработчик кнопки подключения Tonkeeper
    const connectBtn = document.getElementById('connect-tonkeeper-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            alert('Используйте кнопку Connect Wallet выше для подключения');
        });
    }
});
