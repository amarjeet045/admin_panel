function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var reportCards = document.querySelectorAll('.report-card');
var reportStart = 6; // july

var reportEnd = new Date().getMonth(); // current month

var months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var yellowFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: 'FFFFFF00'
  }
};
var redFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: {
    argb: 'FFFF0000'
  }
};
var font = {
  name: 'Arial',
  bold: true
};
var CELL_WIDTH = 13.82;
var CELL_HEIGHT = 15.5;

var init = function init(office, officeId) {
  reportCards.forEach(function (card) {
    var btn = card.querySelector('.download-report-btn');
    var select = document.querySelector('.mdc-select');

    for (var _i = reportStart; _i <= reportEnd; _i++) {
      select.querySelector('.mdc-list').appendChild(monthList(_i));
    }

    var monthSelect = new mdc.select.MDCSelect(select);
    monthSelect.value = new Date().getMonth().toString();
    btn.addEventListener('click', function (ev) {
      btn.classList.add('in-progress');
      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/attendance/?name=MTD&month=").concat(monthSelect.value, "&year=2020")).then(function (response) {
        console.log(response);
        var employees = {};
        var dates = Object.keys(response);

        if (!dates.length) {
          btn.classList.remove('in-progress');
          document.getElementById('report-error').textContent = 'No check-ins found';
          return;
        }

        document.getElementById('report-error').textContent = '';
        var workbook = new ExcelJS.Workbook();
        workbook.creator = 'Growthfile Analytics Pvt Ltd.';
        workbook.created = new Date();
        var sheet = workbook.addWorksheet('Attendance Report', {
          views: [{
            showGridLines: true
          }]
        });
        /** set cell properties like width,height & font */

        sheet.properties.defaultColWidth = CELL_WIDTH;
        sheet.properties.defaultRowHeight = CELL_HEIGHT;
        sheet.mergeCells('A1:B1');
        sheet.getCell('A1').value = 'ATTENDANCE ' + moment(Number(monthSelect.value) + 1, 'MM').format('MMM') + ' 2020';
        sheet.getCell('A1').alignment = {
          horizontal: 'center'
        };
        /** start cell filling operation */

        var startRowIndex = 3;
        var endRowIndex = 5;
        var subHeaders = [];
        dates.forEach(function (date, index) {
          if (moment(date, 'Do MMM YYYY').valueOf() <= moment().valueOf()) {
            response[date].forEach(function (employeeData) {
              if (employeeData.startTime && employeeData.endTime) {
                employeeData.totalHours = moment.duration(moment(employeeData.endTime, 'HH:mm').diff(moment(employeeData.startTime, 'HH:mm'))).asHours().toFixed(2);
              }

              if (employees[employeeData.phoneNumber]) {
                employees[employeeData.phoneNumber].dates.push(_extends(employeeData, {
                  date: date
                }));

                if (employeeData.startTime || employeeData.endTime) {
                  employees[employeeData.phoneNumber].totalDaysWorked++;
                  employees[employeeData.phoneNumber].totalHoursWorked += employeeData.totalHours;
                }
              } else {
                employees[employeeData.phoneNumber] = {
                  employeeName: employeeData['employeeName'],
                  totalDays: dates.length,
                  totalDaysWorked: 0,
                  totalHoursWorked: 0,
                  dates: [_extends(employeeData, {
                    date: date
                  })]
                };

                if (employeeData.startTime || employeeData.endTime) {
                  employees[employeeData.phoneNumber].totalDaysWorked = 1;
                  employees[employeeData.phoneNumber].totalHoursWorked = employeeData.totalHours;
                }
              }
            });

            try {
              sheet.mergeCells(1, startRowIndex, 1, endRowIndex);
              sheet.getRow(1).getCell(startRowIndex).value = date;
              subHeaders.push('start time', 'end time', 'hours');
              startRowIndex = endRowIndex + 1;
              endRowIndex += 3;
            } catch (e) {
              console.log(e);
            }
          }
        });
        subHeaders.push('TOTAL DAYS', 'DAYS WORKED', 'TOTAL HOURS WORKED');
        var newHead = sheet.addRow(['EMP NAME', 'MOBILE NO'].concat(subHeaders));
        newHead.alignment = {
          horizontal: 'center'
        };
        Object.keys(employees).forEach(function (phoneNumber) {
          var dateRangeArr = [];
          var item = employees[phoneNumber];
          item.dates.forEach(function (date) {
            dateRangeArr.push(date.startTime, date.endTime, date.totalHours);
          });
          dateRangeArr.push(item.totalDays, item.totalDaysWorked, item.totalHoursWorked);
          var newRow = sheet.addRow([item.employeeName, phoneNumber].concat(dateRangeArr));
          newRow.alignment = {
            horizontal: 'center'
          }; // start with first date  cell and find hour value
          // if hours are not found mark date as absent
          // if hours are less than 8 mark date as invalid (user didn't completed 8 hours)

          for (i = 5; i < newRow.cellCount; i += 3) {
            var hourCell = newRow.getCell(i);
            var endTimeCell = newRow.getCell(i - 1);
            var startTimeCell = newRow.getCell(i - 2);

            if (newRow.getCell(i).value == null || newRow.getCell(i).value == undefined) {
              sheet.mergeCells(newRow.getCell(i - 2).address, newRow.getCell(i).address);
              hourCell.fill = redFill;
              endTimeCell.fill = redFill;
              startTimeCell.fill = redFill;
              startTimeCell.value = 'ABSENT';
            } else if (newRow.getCell(i).value < 8) {
              hourCell.fill = yellowFill;
              endTimeCell.fill = yellowFill;
              startTimeCell.fill = yellowFill;
            }
          }
        });
        sheet.getColumn(1).width = CELL_WIDTH;
        sheet.getColumn(2).width = CELL_HEIGHT;
        sheet.getRow(1).font = font;
        sheet.getRow(1).alignment = {
          horizontal: 'center'
        };
        sheet.getColumn(1).font = font;
        sheet.getRow(2).font = font;
        sheet.getColumn(2).font = font;
        /** Download workbook */

        workbook.xlsx.writeBuffer().then(function (data) {
          var blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          var url = window.URL.createObjectURL(blob);
          var anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'download.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);
          btn.classList.remove('in-progress');
        });
      });
    });
  });
};

var monthList = function monthList(month) {
  var el = createElement('li', {
    className: 'mdc-list-item'
  });
  el.dataset.value = month;
  el.innerHTML = "<span class = \"mdc-list-item__ripple\"></span> \n         <span class = \"mdc-list-item__text\">".concat(months[month], "</span>");
  return el;
};