const reportCards = document.querySelectorAll('.report-card')
const reportStart = 06; // july
const reportEnd = new Date().getMonth(); // current month
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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


            // http('GET', `${appKeys.getBaseURl()}/api/office/${officeId}/attendance/?name=MTD&month=${monthSelect.value}&year=2020`).then(res => {
            //     const
            // })
            // http('GET', 'https://us-central1-growthfilev2-0.cloudfunctions.net/api/office/gR0XF3YA03MA472QWkNp/attendance/?name=MTD&month=6&year=2020').then(res => {
            // console.log(res)
            // localStorage.setItem('res', JSON.stringify(res))
            const response = JSON.parse(localStorage.getItem('res'))
            const employees = {}

            const dates = Object.keys(response);
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Growthfile Analytics Pvt Ltd.';
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Attendance Report');
            sheet.mergeCells('A1:B1');
            sheet.getCell('A1').value = 'ATTENDANCE ' + moment(monthSelect.value).format('MM') + ' 2020'
            sheet.getCell('A2').value = 'EMP NAME'
            sheet.getCell('B2').value = 'EMP NO'



            // console.log(sheet)
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
                    sheet.getCell(column.letter + '2').value = 'start time'
                    sheet.getCell(sheet.getColumn(startRowIndex + 1).letter + '2').value = 'end time'
                    sheet.getCell(sheet.getColumn(endRowIndex).letter + '2').value = 'hours'
                    startRowIndex = endRowIndex + 1
                    endRowIndex += 3

                } catch (e) {
                    console.log(e)
                }
            })
            Object.keys(employees).forEach(phoneNumber => {
                const dateRangeArr = []
                const item = employees[phoneNumber]

                item.dates.forEach(date => {
                    dateRangeArr.push(date.startTime, date.endTime, date.totalHours)
                })
                console.log(dateRangeArr)
                sheet.addRow([...[item.employeeName, phoneNumber], ...dateRangeArr])
            })
            console.log(employees);
            sheet.getRow(1).font = {
                name: 'Arial',
                bold: true
            }
            sheet.getRow(1).alignment = {
                horizontal: 'center'
            }
            sheet.getRow(2).font = {
                name: 'Arial',
                bold: true
            }
            sheet.getRow(2).alignment = {
                horizontal: 'center'
            }



            workbook.xlsx.writeBuffer().then(data => {
                console.log(data)
                var blob = new Blob([data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                const url = window.URL.createObjectURL(blob);

                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'download.xls';
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