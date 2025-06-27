document.addEventListener('DOMContentLoaded', () => {
    // Открытие модалки подключения
    document.getElementById('open-connect-modal').addEventListener('click', () => {
        openModal('connect-modal');
    });

    // Кнопка подтверждения отправки
    document.getElementById('confirm-transfer-btn').addEventListener('click', sendTokens);

    // Закрытие модалок
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            closeModal(modal.id);
        });
    });

    // Закрытие по клику вне контента
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal(this.id);
        });
    });
});

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
