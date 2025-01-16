document.addEventListener('DOMContentLoaded', () => {
    // Переменные для отслеживания состояния окон
    const windows = [
        { element: document.getElementById('window1'), src: 'pages/explorer.html' },
        { element: document.getElementById('window2'), src: 'pages/links.html' },
        { element: document.getElementById('window3'), src: 'pages/game.html' },
        { element: document.getElementById('window4'), src: 'pages/browser.html' }
    ];
    const taskbarIcons = document.getElementById('taskbar-icons');

    // Добавление обработчиков событий для иконок
    document.querySelectorAll('.icon').forEach((icon, index) => {
        icon.addEventListener('click', () => {
            const appName = icon.getAttribute('data-app');
            const windowData = windows[index];
            const windowEl = windowData.element;

            if (!windowEl.style.display || windowEl.style.display === 'none') {
                // Проверка и создание iframe, если его нет
                let iframe = windowEl.querySelector('iframe');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    windowEl.appendChild(iframe); // Добавляем iframe в окно
                }
                iframe.src = windowData.src; // Загружаем содержимое
            }

            windowEl.style.display = 'block'; // Показываем окно
            addTaskbarIcon(appName, index); // Добавляем иконку в таскбар
        });
    });

    // Добавление иконки приложения в таскбар
    function addTaskbarIcon(appName, index) {
        if (!document.getElementById(`taskbar-icon${index}`)) {
            const taskbarIcon = document.createElement('div');
            taskbarIcon.className = 'taskbar-icon';
            taskbarIcon.id = `taskbar-icon${index}`;
            taskbarIcon.innerText = appName;
            taskbarIcon.addEventListener('click', () => {
                const windowEl = windows[index].element;
                if (!windowEl.style.display || windowEl.style.display === 'none') {
                    let iframe = windowEl.querySelector('iframe');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        windowEl.appendChild(iframe); // Добавляем iframe в окно
                    }
                    iframe.src = windows[index].src; // Загружаем содержимое
                }
                windowEl.style.display = 'block';
                removeTaskbarIcon(index); // Удаляем иконку при открытии окна
            });
            taskbarIcons.appendChild(taskbarIcon);
        }
    }

    // Удаление иконки приложения из таскбара
    function removeTaskbarIcon(index) {
        const taskbarIcon = document.getElementById(`taskbar-icon${index}`);
        if (taskbarIcon) {
            taskbarIcons.removeChild(taskbarIcon);
        }
    }

    // Обработка кнопок окна
    windows.forEach((windowData, index) => {
        const windowEl = windowData.element;
        const titleBar = windowEl.querySelector('.title-bar');
        const minimizeBtn = windowEl.querySelector(`#minimize${index + 1}`);
        const maximizeBtn = windowEl.querySelector(`#maximize${index + 1}`);
        const closeBtn = windowEl.querySelector(`#close${index + 1}`);

        // Перетаскивание окна
        titleBar.onmousedown = function(event) {
            let shiftX = event.clientX - windowEl.getBoundingClientRect().left;
            let shiftY = event.clientY - windowEl.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                windowEl.style.left = pageX - shiftX + 'px';
                windowEl.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            titleBar.onmouseup = function() {
                document.removeEventListener('mousemove', onMouseMove);
                titleBar.onmouseup = null;
            };
        };

        titleBar.ondragstart = function() {
            return false;
        };

        // Обработка кнопок окна
        minimizeBtn.onclick = () => {
            windowEl.style.display = 'none';
            removeTaskbarIcon(index); // Удаляем иконку при сворачивании окна
        };
        maximizeBtn.onclick = () => {
            windowEl.style.width = '100%';
            windowEl.style.height = 'calc(100% - 5vh)'; // Высота окна на 95% за вычетом высоты таскбара
        };
        closeBtn.onclick = () => {
            windowEl.style.display = 'none';
            let iframe = windowEl.querySelector('iframe');
            if (iframe) {
                iframe.src = ''; // Выгружаем содержимое из памяти
            }
            removeTaskbarIcon(index); // Удаляем иконку при закрытии окна
        };
    });
    let isMouseDown = false;
let startX, startY, startWidth, startHeight;
let currentWindow = null;
let resizableElement = null;

// Отслеживаем начало перетаскивания или растягивания
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // ЛКМ
        const mouseX = event.pageX;
        const mouseY = event.pageY;

        // Проверяем, если мышь на заголовке окна
        if (event.target.classList.contains('title-bar')) {
            // Если мышь на заголовке, начинаем перетаскивание
            isMouseDown = true;
            startX = mouseX;
            startY = mouseY;

            // Ищем окно, которое нужно переместить
            currentWindow = event.target.closest('.window');
            if (currentWindow) {
                // Если окно найдено, начинаем перетаскивание
                currentWindow.style.position = 'absolute';
                resizableElement = null;  // Останавливаем растягивание
            }
        }

        // Проверка на область растягивания окна (например, правый нижний угол)
        if (event.target.classList.contains('resize-handle')) {
            // Если мышь на углу, начинаем растягивание
            isMouseDown = true;
            startX = mouseX;
            startY = mouseY;
            startWidth = currentWindow.offsetWidth;
            startHeight = currentWindow.offsetHeight;
            resizableElement = currentWindow;  // Запоминаем окно, которое растягиваем
            currentWindow = null;  // Останавливаем перемещение
        }
    }
});

// Отслеживаем движение мыши
document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {  // Движение только при нажатой кнопке мыши
        if (currentWindow && !resizableElement) {
            // Перемещение окна
            const offsetX = event.pageX - startX;
            const offsetY = event.pageY - startY;

            // Перемещаем окно
            currentWindow.style.left = `${currentWindow.offsetLeft + offsetX}px`;
            currentWindow.style.top = `${currentWindow.offsetTop + offsetY}px`;

            // Обновляем начальные координаты для следующего движения
            startX = event.pageX;
            startY = event.pageY;
        }

        if (resizableElement) {
            // Растягиваем окно
            const width = startWidth + (event.pageX - startX);
            const height = startHeight + (event.pageY - startY);

            // Ограничиваем минимальный размер
            resizableElement.style.width = `${Math.max(100, width)}px`;
            resizableElement.style.height = `${Math.max(100, height)}px`;
        }
    }
});

// Отслеживаем отпускание мыши
document.addEventListener('mouseup', () => {
    // Только если кнопка мыши была зажата
    if (isMouseDown) {
        isMouseDown = false;
        currentWindow = null;
        resizableElement = null; // Очищаем переменную для растягивания
    }
});

});
