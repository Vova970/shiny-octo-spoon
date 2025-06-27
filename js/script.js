// Функции для работы с модальными окнами
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Открытие модалки подключения
    const openConnectBtn = document.getElementById('open-connect-modal');
    if (openConnectBtn) {
        openConnectBtn.addEventListener('click', () => {
            openModal('connect-modal');
        });
    }

    // Кнопка подтверждения отправки
    const confirmTransferBtn = document.getElementById('confirm-transfer-btn');
    if (confirmTransferBtn) {
        confirmTransferBtn.addEventListener('click', () => {
            if (window.sendTokens) {
                window.sendTokens();
            }
        });
    }

    // Модальное окно бирж
    const openExchangesBtn = document.getElementById('open-exchanges-modal');
    if (openExchangesBtn) {
        openExchangesBtn.addEventListener('click', () => {
            openModal('exchanges-modal');
        });
    }

    // Закрытие модалок
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Закрытие по клику вне контента
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
});
