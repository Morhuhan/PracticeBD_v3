document.addEventListener('DOMContentLoaded', function() {
    var mainTable = document.querySelector('.mainTable');
    UpdateNavigationPanel();
    GetPageFromTable(1);
    AddSortingToTableHeaders(mainTable);
    AttachDataSourceRowClick();
});

function AddRowToTable(jsonRow, table) {
    var jsonData = (typeof jsonRow === 'string') ? JSON.parse(jsonRow) : jsonRow;
    var tableBody = table.querySelector('tbody');
    var headers = table.querySelectorAll('th');
    var row = tableBody.insertRow();

    // Проходим по всем заголовкам и заполняем ячейки
    Array.from(headers).forEach(function(header) {
        var cell = row.insertCell();
        // Используем атрибут 'name' заголовка для получения значения из jsonData
        var jsonFieldName = header.getAttribute('name');
        var value = jsonData[jsonFieldName] || '';
        cell.textContent = value;

        // Проверяем наличие атрибута 'data-expanded-source'
        var expandedSource = header.getAttribute('data-expanded-source');
        if (expandedSource) {
            // Вызываем функцию GetExpandedData для этого столбца
            GetExpandedData(cell, header);
        }
    });

    row.addEventListener('click', TableRowClick);
}

function GetPageFromTable(pageNumber) {
    currentPage = pageNumber;
    var itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    var mainTable = document.querySelector('.mainTable');
    var tableName = mainTable.getAttribute('name');
    var tableBody = mainTable.querySelector('tbody');

    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    var requestData = {
        tablename: tableName,
        pagenumber: pageNumber,
        itemsperpage: itemsPerPage
    };

    fetch('/getPage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.error || 'Network response was not ok');
            });
        }
        return response.json();
    })
    .then(result => {
        if (result.length === 0 && currentPage > 1) {
            currentPage -= 1;
            GetPageFromTable(currentPage);
        } else {
            result.forEach(jsonRow => {
                AddRowToTable(jsonRow, mainTable);
            });

            SortTable(mainTable, 0);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        alert(error.message);
    });
}

function formatDataWithPrefix(data, prefix) {
    // Если data не массив, превращаем его в массив
    if (!Array.isArray(data)) {
        data = [data];
    }

    // Используем reduce для создания строки с заменой символов * и $ на <br>
    return data.reduce((formattedString, value) => {
        // Заменяем первое вхождение * на текущее значение value
        formattedString = formattedString.replace('*', value);
        // Заменяем все вхождения $ на тег <br> для переноса строки в HTML
        return formattedString.replace(/\$/g, '<br>');
    }, prefix);
}

function GetExpandedData(cell, header) {
    var value = cell.textContent;

    // Установка скрытого атрибута с прочитанным значением
    cell.setAttribute('data-value', value);

    var expandedSource = header.dataset.expandedSource;
    var expandedColumns = header.dataset.expendedColumns.split(', ');
    var columnName = header.getAttribute('name');
    var expandedPrefix = header.dataset.expandedPrefix;

    var dataToSend = {
        value: value,
        columnName: columnName,
        expandedSource: expandedSource,
        expandedColumns: expandedColumns
    };

    var jsonString = JSON.stringify(dataToSend);

    fetch('/getExpandedData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonString
    })
    .then(response => response.json())
    .then(data => {
        // Создаем упорядоченный массив данных
        var orderedData = expandedColumns.map(column => data[column]);

        // Форматируем данные с префиксом
        var formattedData = formatDataWithPrefix(orderedData, expandedPrefix);

        // Устанавливаем отформатированные данные в ячейку
        cell.innerHTML  = formattedData;
    })
    .catch(error => {
        console.error('Error fetching expanded data:', error);
        cell.textContent = 'Error loading data';
    });
}

function SubmitCreateForm(event) {
    event.preventDefault();

    var form = document.getElementById('createForm');
    var inputs = form.getElementsByTagName('input');

    var objectData = {};
    var mainTable = document.querySelector('.mainTable');
    var tableName = mainTable.getAttribute('name');

    for (var i = 0; i < inputs.length; i++) {
        objectData[inputs[i].name] = inputs[i].value;
    }

    var jsonData = JSON.stringify(objectData);
    var url = '/addData/' + encodeURIComponent(tableName);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error);
            });
        }
        GetPageFromTable(currentPage, mainTable);
        UpdateNavigationPanel();
    })
    .catch(error => {
        alert(error.message);
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function SubmitEditForm(event) {
    event.preventDefault();

    var mainTable = document.querySelector('.mainTable');
    var tableName = mainTable.getAttribute('name');

    var formData = new FormData(document.getElementById('editForm'));

    // Преобразование FormData в простой объект
    var rowData = {};
    formData.forEach(function(value, key){
        rowData[key] = value;
    });

    // Преобразование объекта rowData в строку JSON
    var jsonString = JSON.stringify(rowData);

    var url = '/editData/' + encodeURIComponent(tableName);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error);
            });
        }
        else {
            GetPageFromTable(currentPage); // Предполагается, что эта функция обновляет текущую страницу или таблицу
        }
    })
    .catch(error => {
        alert(error.message);
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function SubmitDeleteForm(event) {
    event.preventDefault();

    var mainTable = document.querySelector('.mainTable');
    var tableName = mainTable.getAttribute('name');

    var formData = new FormData(document.getElementById('deleteForm'));
    var rowData = {}; // Объявляем объект rowData

    // Перебираем все элементы input внутри формы
    document.querySelectorAll('#deleteForm input').forEach(function(input){
        // Добавляем в объект rowData значения, если input не пустой
        if(input.value) {
            rowData[input.name] = input.value;
        }
    });

    // Преобразование объекта rowData в строку JSON
    var jsonString = JSON.stringify(rowData);

    var url = '/deleteData/' + encodeURIComponent(tableName);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonString
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error);
            });
        }
        else {
            GetPageFromTable(currentPage); // Предполагается, что currentPage определен где-то в коде
            UpdateNavigationPanel(); // Предполагается, что UpdateNavigationPanel определена где-то в коде
        }
    })
    .catch(error => {
        alert(error.message);
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function UpdateNavigationPanel() {
    var itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    var navigationPanel = document.getElementById('navigationPanel');
    var mainTable = document.querySelector('.mainTable');
    var tableName = mainTable.getAttribute('name');

    navigationPanel.innerHTML = '';

    var url = '/getCount/' + encodeURIComponent(tableName);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        var totalItems = data;
        var totalPages = Math.ceil(totalItems / itemsPerPage);

        // Установка currentPage в 1, если totalPages равно 0
        if (totalPages === 0) {
            totalPages = 1;
        }

        if (currentPage > totalPages) {
            currentPage = totalPages;
        } else if (currentPage < 1) {
            currentPage = 1;
        }

        for (var i = 1; i <= totalPages; i++) {
            (function(i) {
                var button = document.createElement('button');
                button.innerText = i;
                button.onclick = function() {
                    currentPage = i; // Обновление currentPage при клике
                    GetPageFromTable(i, mainTable);
                    var buttons = navigationPanel.getElementsByTagName('button');
                    for (var j = 0; j < buttons.length; j++) {
                        buttons[j].classList.remove('active');
                    }
                    button.classList.add('active');
                };
                // Установка класса active для кнопки, соответствующей текущей странице
                if (i === currentPage) {
                    button.classList.add('active');
                }
                navigationPanel.appendChild(button);
            })(i);
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function TableRowClick() {
    var cells = this.cells; // Получаем ячейки текущей строки
    var mainTable = document.querySelector('.mainTable');
    var columns = mainTable.getElementsByTagName('th'); // Получаем колонки таблицы

    // Получаем формы для редактирования и удаления
    var editForm = document.getElementById("editForm");
    var deleteForm = document.getElementById("deleteForm");

    // Заполняем input элементы в форме редактирования
    Array.from(editForm.querySelectorAll("input")).forEach(function(input) {
        var fieldName = input.name;
        var column = Array.from(columns).find(th => th.getAttribute("name") === fieldName);
        var cellIndex = Array.from(columns).indexOf(column);
        if (cellIndex !== -1) {
            // Проверяем наличие атрибута data-value у ячейки
            var cellValue = cells[cellIndex].hasAttribute('data-value') ? cells[cellIndex].getAttribute('data-value') : cells[cellIndex].textContent;
            input.value = cellValue;
        }
    });

    // Заполняем input элементы в форме удаления
    Array.from(deleteForm.querySelectorAll("input")).forEach(function(input) {
        var fieldName = input.name;
        var column = Array.from(columns).find(th => th.getAttribute("name") === fieldName);
        var cellIndex = Array.from(columns).indexOf(column);
        if (cellIndex !== -1) {
            // Проверяем наличие атрибута data-value у ячейки
            var cellValue = cells[cellIndex].hasAttribute('data-value') ? cells[cellIndex].getAttribute('data-value') : cells[cellIndex].textContent;
            input.value = cellValue;
        }
    });

    // Убираем выделение со всех строк таблицы
    var tableRows = document.querySelectorAll('.mainTable tr');
    tableRows.forEach(function(otherRow) {
        otherRow.classList.remove("selected");
    });

    // Добавляем класс "selected" к текущей строке, чтобы выделить её
    this.classList.add("selected");
}

function AddSortingToTableHeaders(table) {
    var headers = table.getElementsByTagName("th");
    for (let i = 0; i < headers.length; i++) {
        headers[i].addEventListener("click", function() {
            SortTable(table, i);
        });
    }
}

function SortTable(table, columnIndex) {
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    // Продолжаем цикл до тех пор, пока не будет выполнено ни одной перестановки
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        // Проходим по всем строкам таблицы, кроме заголовка
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            // Получаем сравниваемые элементы
            x = rows[i].getElementsByTagName("TD")[columnIndex];
            y = rows[i + 1].getElementsByTagName("TD")[columnIndex];
            // Проверяем, являются ли значения числами
            var xValue = isNaN(x.innerHTML) ? x.innerHTML.toLowerCase() : parseFloat(x.innerHTML);
            var yValue = isNaN(y.innerHTML) ? y.innerHTML.toLowerCase() : parseFloat(y.innerHTML);
            // Определяем, должны ли элементы поменяться местами
            if (xValue > yValue) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            // Если элементы должны поменяться местами, выполняем перестановку и помечаем, что была выполнена перестановка
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function AttachDataSourceRowClick() {
    // Получаем все формы на странице
    var forms = document.querySelectorAll('form');

    // Перебираем каждую форму
    forms.forEach(function(form) {
        // Находим все элементы внутри формы с атрибутом data-source
        var elementsWithDataSources = form.querySelectorAll('[data-source]');

        // Перебираем найденные элементы
        elementsWithDataSources.forEach(function(element) {
            // Навешиваем событие onClick на каждый элемент
            element.onclick = function() {
                // Вызываем функцию DataSourceRowClick с аргументом - значением атрибута data-source
                DataSourceRowClick(element, form);
            };
        });
    });
}

function DataSourceRowClick(element, form) {
    var sourceTableName = element.getAttribute('data-source');
    var orderValue = element.getAttribute('data-order');
    var orders = [];

    if (orderValue) {
        var orderElements = form.querySelectorAll('[data-order]');

        orderElements.forEach(function(el) {
            var elOrderValue = el.getAttribute('data-order');
            if (elOrderValue < orderValue) {
                var key = el.getAttribute('name') || el.getAttribute('id');
                var orderObject = {};
                orderObject[key] = el.value;
                orders.push(orderObject);
            }
        });
    }

    var url = '/getAllRecords/' + encodeURIComponent(sourceTableName);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orders)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error);
            });
        }
        return response.json();
    })
    .then(result => {
        DataSourceCreateModal(result, element);
    })
    .catch(error => {
        alert(error.message);
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function DataSourceCreateModal(data, element) {
    // Создаем элемент модального окна
    var modal = document.createElement('div');
    modal.setAttribute('class', 'modal');

    // Создаем элемент таблицы
    var table = document.createElement('table');
    table.setAttribute('class', 'table');

    // Получаем порядок столбцов из атрибута data-columns-order
    var columnsOrder = element.getAttribute('data-columns-order').split(', ');

    // Создаем заголовки таблицы на основе columnsOrder
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    columnsOrder.forEach(function(column) {
        var th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Создаем тело таблицы
    var tbody = document.createElement('tbody');

    // Проверяем, что data содержит массив объектов
    if (Array.isArray(data) && data.length > 0) {
        // Добавляем строки в таблицу
        data.forEach(function(item) {
            var row = document.createElement('tr');

            columnsOrder.forEach(function(column) {
                var td = document.createElement('td');
                // Используем column для получения значения из объекта item
                td.textContent = item[column] || ''; // Если ключа нет, вставляем пустую строку
                td.setAttribute('data-field-name', column);
                row.appendChild(td);
            });

            // Навешиваем обработчик события onclick на каждую строку
            row.addEventListener('click', function() {
                DataSourceModalRowClick(element, this);
                var event = new Event('input', { bubbles: true });
                element.dispatchEvent(event);
            });
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
    } else {
        // Если данных нет, выводим сообщение
        var noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'No data available.';
        modal.appendChild(noDataMsg);
    }

    // Добавляем таблицу в модальное окно
    modal.appendChild(table);

    // Добавляем модальное окно в body документа
    document.body.appendChild(modal);

    // Отображаем модальное окно
    modal.style.display = 'block';

    // Создаем элемент затемнения фона
    var backdrop = document.createElement('div');
    backdrop.setAttribute('class', 'modal-backdrop');

    // Добавляем затемнение фона в body документа
    document.body.appendChild(backdrop);

    // Отображаем затемнение фона
    backdrop.style.display = 'block';

    // Добавляем обработчик клика на затемнение фона для закрытия модального окна
    backdrop.addEventListener('click', function() {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    });
}

function DataSourceModalRowClick(element, row) {
    // Получаем значение атрибута data-name для input элемента
    var dataName = element.getAttribute('name');

    // Находим ячейку в строке с соответствующим data-field-name
    var selectedCell = row.querySelector(`td[data-field-name="${dataName}"]`);

    // Проверяем, что ячейка найдена
    if (selectedCell) {
        // Вставляем текст из ячейки в input элемент
        element.value = selectedCell.textContent;

        // Закрываем модальное окно и затемнение фона
        var modal = document.querySelector('.modal');
        var backdrop = document.querySelector('.modal-backdrop');
        if (modal && backdrop) {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.removeChild(modal);
            document.body.removeChild(backdrop);
        }
    } else {
        // Если ячейка не найдена, выводим сообщение об ошибке
        console.error('No matching data-field-name found in the row');
    }
}

