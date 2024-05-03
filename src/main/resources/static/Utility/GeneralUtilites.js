document.addEventListener('DOMContentLoaded', function() {
    enableStickyScrolling();
});


function toggleMenu(display) {
    var submenu = document.getElementById("submenu");
    submenu.style.display = display;
}

function ShowDeleteForm() {
    document.getElementById("forms").style.display = "block";
    document.getElementById("deleteForm").style.display = "block";
    document.getElementById("editForm").style.display = "none";
    document.getElementById("createForm").style.display = "none";
}

function ShowEditForm() {
    document.getElementById("forms").style.display = "block";
    document.getElementById("deleteForm").style.display = "none";
    document.getElementById("editForm").style.display = "block";
    document.getElementById("createForm").style.display = "none";
}

function ShowCreateForm() {
    document.getElementById("forms").style.display = "block";
    document.getElementById("deleteForm").style.display = "none";
    document.getElementById("editForm").style.display = "none";
    document.getElementById("createForm").style.display = "block";
}

function checkDataFormat(date) {
    var regex = /^\d{4}\-\d{2}\-\d{2}$/;
    return regex.test(date) ? 1 : 0;
}

function checkTimestampFormat(timestamp) {
    var regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/;
    return regex.test(timestamp) ? 1 : 0;
}

function wrongDateAlert() {
    alert("Неверный формат даты. Пожалуйста, введите дату в правильном формате: YYYY-MM-DD ");
}

function wrongTimestampAlert() {
alert("Неверный формат timestamp. Пожалуйста, введите дату и время в правильном формате: 'YYYY-MM-DD HH:MM:SS.mmm', где YYYY обозначает год, MM — месяц, DD — день, HH — часы, MM — минуты, SS — секунды, а mmm — миллисекунды.");
}

function enableStickyScrolling() {
    // Получаем элемент container2
    var container2 = document.getElementById('container2');
    if (!container2) {
        console.error('Element container2 not found!');
        return;
    }

    // Создаем пустой элемент-заполнитель с теми же размерами, что и container2
    var placeholder = document.createElement('div');
    placeholder.style.width = container2.offsetWidth + 'px';
    placeholder.style.height = container2.offsetHeight + 'px';
    placeholder.style.visibility = 'hidden';
    placeholder.setAttribute('id', 'container2-placeholder');

    // Вставляем заполнитель перед container2 в DOM
    container2.parentNode.insertBefore(placeholder, container2);

    // Функция для обновления позиции container2 при прокрутке
    var updatePosition = function() {
        var newTop = window.pageYOffset + 'px';
        container2.style.position = 'absolute';
        container2.style.top = newTop;
    };

    // Добавляем обработчик события прокрутки к окну
    window.addEventListener('scroll', updatePosition);

    // Вызываем функцию updatePosition сразу, чтобы container2 был правильно позиционирован при загрузке
    updatePosition();
}



