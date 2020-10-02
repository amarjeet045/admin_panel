const reportCards = document.querySelectorAll('.report-card')
const reportStart = 06; // july
const reportEnd = new Date().getMonth(); // current month
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const yellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
        argb: 'FFFFFF00'
    },

};
const redFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
        argb: 'FFFF0000'
    },
};

const font = {
    name: 'Arial',
    bold: true
}
const CELL_WIDTH = 13.82;
const CELL_HEIGHT = 15.5;

const init = (office, officeId) => {

    reportCards.forEach(card => {
        const btn = card.querySelector('.download-report-btn')
        const select = document.querySelector('.mdc-select');
        for (let i = reportStart; i <= reportEnd; i++) {
            select.querySelector('.mdc-list').appendChild(monthList(i))
        }
        const monthSelect = new mdc.select.MDCSelect(select)
        monthSelect.value = new Date().getMonth().toString()
        btn.addEventListener('click', (ev) => {
            btn.classList.add('in-progress');

            // return

            // http('GET', `${appKeys.getBaseURl()}/api/office/${officeId}/attendance/?name=MTD&month=${monthSelect.value}&year=2020`).then(res => {
            //     const
            // })
            // http('GET', 'https://us-central1-growthfilev2-0.cloudfunctions.net/api/office/gR0XF3YA03MA472QWkNp/attendance/?name=MTD&month=6&year=2020').then(res => {
            // console.log(res)
            // localStorage.setItem('res', JSON.stringify(res))


            let response = JSON.parse(localStorage.getItem('res'))
            const employees = {}

            console.log(response)
            response['2nd Jul 2020'][0].startTime = null
            response['2nd Jul 2020'][0].endTime = null

            const dates = Object.keys(response);
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Growthfile Analytics Pvt Ltd.';
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Attendance Report', {
                views: [{
                    showGridLines: true
                }]
            });

            /** set cell properties like width,height & font */
            sheet.properties.defaultColWidth = CELL_WIDTH
            sheet.properties.defaultRowHeight = CELL_HEIGHT

            sheet.mergeCells('A1:B1');
            sheet.getCell('A1').value = 'ATTENDANCE ' + moment(monthSelect.value).format('MM') + ' 2020'
            sheet.getCell('A1').alignment = {
                horizontal: 'center'
            }

            /** start cell filling operation */
            let startRowIndex = 3;
            let endRowIndex = 5;

            dates.forEach((date, index) => {

                response[date].forEach(employeeData => {
                    let totalDaysWorked;
                    if (employeeData.startTime && employeeData.endTime) {
                        employeeData.totalHours = moment.duration(moment(employeeData.endTime, 'HH:mm').diff(moment(employeeData.startTime, 'HH:mm'))).asHours();
                    }
                    if (employees[employeeData.phoneNumber]) {
                        employees[employeeData.phoneNumber].dates.push(Object.assign(employeeData, {
                            date
                        }))
                        if (employeeData.startTime || employeeData.endTime) {
                            employees[employeeData.phoneNumber].totalDaysWorked++
                            employees[employeeData.phoneNumber].totalHoursWorked += employeeData.totalHours
                        }
                    } else {
                        employees[employeeData.phoneNumber] = {
                            employeeName: employeeData['employeeName'],
                            totalDays: dates.length,
                            totalDaysWorked,
                            totalHoursWorked: 0,
                            dates: [Object.assign(employeeData, {
                                date
                            })]
                        }
                        if (employeeData.startTime || employeeData.endTime) {
                            employees[employeeData.phoneNumber].totalDaysWorked = 1
                            employees[employeeData.phoneNumber].totalHoursWorked = employeeData.totalHours

                        }
                    }
                })

                try {
                    sheet.mergeCells(1, startRowIndex, 1, endRowIndex)
                    const column = sheet.getColumn(startRowIndex)
                    column.header = date
                    column.alignment = {
                        horizontal: 'center'
                    }
                    startRowIndex = endRowIndex + 1
                    endRowIndex += 3

                } catch (e) {
                    console.log(e)
                }
            })


            console.log(employees)
            Object.keys(employees).forEach(phoneNumber => {
                const dateRangeArr = []
                const subHeaders = []
                const item = employees[phoneNumber]
                item.dates.forEach(date => {

                    subHeaders.push('start time', 'end time', 'hours')

                    dateRangeArr.push(date.startTime, date.endTime, date.totalHours)
                })
                subHeaders.push('TOTAL DAYS', 'DAYS WORKED', 'TOTAL HOURS WORKED')
                dateRangeArr.push(item.totalDays, item.totalDaysWorked, item.totalHoursWorked)

                const newHead = sheet.addRow([...['EMP NAME', 'MOBILE NO'], ...subHeaders])
                const newRow = sheet.addRow([...[item.employeeName, phoneNumber], ...dateRangeArr])

                newHead.alignment = {
                    horizontal: 'center'
                }
                newRow.alignment = {
                    horizontal: 'center'
                }

                // start with first date  cell and find hour value
                // if hours are not found mark date as absent
                // if hours are less than 8 mark date as invalid (user didn't completed 8 hours)

                for (i = 5; i <= newRow.cellCount - 3; i += 3) {
                    const hourCell = newRow.getCell(i);
                    const endTimeCell = newRow.getCell(i - 1);
                    const startTimeCell = newRow.getCell(i - 2);

                    if (newRow.getCell(i).value == null || newRow.getCell(i).value == undefined) {
                        sheet.mergeCells(newRow.getCell(i - 2).address, newRow.getCell(i).address)
                        hourCell.fill = redFill
                        endTimeCell.fill = redFill
                        startTimeCell.fill = redFill
                        startTimeCell.value = 'ABSENT'
                    } else if (newRow.getCell(i).value < 8) {
                        hourCell.fill = yellowFill
                        endTimeCell.fill = yellowFill
                        startTimeCell.fill = yellowFill
                    }
                }
            })

            sheet.getColumn(1).width = CELL_WIDTH
            sheet.getColumn(2).width = CELL_HEIGHT

            sheet.getRow(1).font = font
            sheet.getColumn(1).font = font
            sheet.getRow(2).font = font
            sheet.getColumn(2).font = font

            console.log(sheet)

            /** Download workbook */
            workbook.xlsx.writeBuffer().then(data => {
                console.log(data)
                var blob = new Blob([data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                const url = window.URL.createObjectURL(blob);

                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'download.xlsx';
                anchor.click();
                window.URL.revokeObjectURL(url);
            })
        })
    })
}


const monthList = (month) => {
    const el = createElement('li', {
        className: 'mdc-list-item',

    })
    el.dataset.value = month
    el.innerHTML = `<span class = "mdc-list-item__ripple"></span> 
         <span class = "mdc-list-item__text">${months[month]}</span>`
    return el;
}