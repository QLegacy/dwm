let isMouseDown = false;
let startX, startY, startWidth, startHeight;
let resizableElement;
let inactivityTimeout;

// Функция для удаления квадрата, если не было активности
function removeElementIfInactive() {
    if (resizableElement) {
        resizableElement.remove();
        resizableElement = null;
    }
}

// Функция для проверки, наведена ли мышь на окно
function isMouseInsideWindow(x, y) {
    const windows = document.querySelectorAll('.window');  // Все окна с классом .window
    for (let windowEl of windows) {
        const rect = windowEl.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return true;
        }
    }
    return false;
}

// Отслеживаем начало перетаскивания
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // ЛКМ
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        // Проверяем, не находится ли мышь внутри окна
        if (isMouseInsideWindow(mouseX, mouseY)) {
            return; // Если мышь в пределах окна, не создаем квадрат
        }

        isMouseDown = true;
        startX = mouseX;
        startY = mouseY;

        // Создаем новый квадрат
        resizableElement = document.createElement('div');
        resizableElement.classList.add('resizable');
        resizableElement.style.left = `${startX}px`;
        resizableElement.style.top = `${startY}px`;
        resizableElement.style.width = '0px';
        resizableElement.style.height = '0px';
        document.body.appendChild(resizableElement);

        // Устанавливаем таймер на 1 секунду, чтобы удалить квадрат, если не будет активности
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(removeElementIfInactive, 1000);
    }
});

// Отслеживаем движение мыши
document.addEventListener('mousemove', (event) => {
    if (isMouseDown && resizableElement) {
        const width = event.pageX - startX;
        const height = event.pageY - startY;

        // Обновляем размер квадрата
        resizableElement.style.width = `${Math.abs(width)}px`;
        resizableElement.style.height = `${Math.abs(height)}px`;

        // Поддерживаем положение верхнего левого угла
        resizableElement.style.left = `${width < 0 ? event.pageX : startX}px`;
        resizableElement.style.top = `${height < 0 ? event.pageY : startY}px`;

        // Если движение произошло, сбрасываем таймер
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(removeElementIfInactive, 1000);
    }
});

// Отслеживаем отпускание мыши
document.addEventListener('mouseup', () => {
    if (isMouseDown) {
        // Если квадрат был перемещен, оставляем его
        clearTimeout(inactivityTimeout); // Останавливаем таймер удаления

        // Убираем созданный квадрат, если был зафиксирован
        if (resizableElement) {
            resizableElement.remove();
        }

        isMouseDown = false;
    }
});
