const reportCards = document.querySelectorAll('.report-card')
const reportStart = 06; // july
const reportEnd = new Date().getMonth(); // current month
const months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const init = (office, officeId) => {

    document.getElementById('file').addEventListener('change', (ev) => {
        const fileList = ev.target.files;
        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader()

        reader.readAsArrayBuffer(fileList[0])
        reader.onload = function () {
            const buffer = reader.result;
            workbook.xlsx.load(buffer).then(wbs => {
                console.log(wbs.worksheets[0])
                console.log(wbs.worksheets[0].getCell('H5'))

            })
        }
        // workbook.xlsx.readFile(fileList[0]).then((data) => {
        //     // var worksheet = workbook.getWorksheet();
        //     // for (var v = 1; v <= worksheet.actualRowCount; v++) {
        //     //     var lN = worksheet.getCell("B" + v).value;
        //     //     console.log(" V :" + v + "------ Name :" + lN);
        //     // }
        //     console.log(workbook)
        // })
    })







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
            sheet.mergeCells('A1:B1');
            sheet.getCell('A1').value = 'ATTENDANCE ' + moment(monthSelect.value).format('MM') + ' 2020'
            // sheet.getCell('A2').value = 'EMP NAME'
            // sheet.getCell('B2').value = 'EMP NO'



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
                    startRowIndex = endRowIndex + 1
                    endRowIndex += 3

                } catch (e) {
                    console.log(e)
                }
            })


            const notFullArr = [];
            let col = 3;
            let row = 3;
            console.log(employees)
            Object.keys(employees).forEach(phoneNumber => {
                const dateRangeArr = []
                const subHeaders = []
                const item = employees[phoneNumber]
                row++
                item.dates.forEach(date => {

                    subHeaders.push('start time', 'end time', 'hours')
                    if (date.totalHours < 8) {
                        notFullArr.push(`${sheet.getColumn(col).letter}${row}`, `${sheet.getColumn(col+1).letter}${row}`, `${sheet.getColumn(col+2).letter}${row}`)
                    }

                    col++
                    dateRangeArr.push(date.startTime, date.endTime, date.totalHours)
                })
                subHeaders.push('TOTAL DAYS', 'DAYS WORKED', 'TOTAL HOURS WORKED')
                dateRangeArr.push(item.totalDays, item.totalDaysWorked, item.totalHoursWorked)

                const newHead = sheet.addRow([...['EMP NAME', 'EMP NO'], ...subHeaders])
                const newRow = sheet.addRow([...[item.employeeName, phoneNumber], ...dateRangeArr])
                for (i = 5; i <= newRow.cellCount - 3; i += 3) {
                    console.log(newRow.getCell(i).value)
                    if (newRow.getCell(i).value == null || newRow.getCell(i).value == undefined) {

                        sheet.mergeCells(newRow.getCell(i - 2).address, newRow.getCell(i).address)
                        newRow.getCell(i - 2).value = 'ABSENT'

                        newRow.getCell(i).fill = {
                            type: 'pattern',
                            pattern: 'darkVertical',
                            fgColor: {
                                argb: 'FFFF0000'
                            },

                        };

                        newRow.getCell(i - 1).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: {
                                argb: 'FFFF0000'
                            },

                        };
                        newRow.getCell(i - 2).fill = {
                            type: 'pattern',
                            pattern: 'darkTrellis',
                            fgColor: {
                                argb: 'FFFF0000'
                            },

                        };
                    } else if (newRow.getCell(i).value < 8) {
                        newRow.getCell(i).fill = {
                            type: 'pattern',
                            pattern: 'darkVertical',
                            fgColor: {
                                argb: 'FFFFFF00'
                            },
                            bgColor: {
                                argb: 'FFFFFF00'
                            }
                        };

                        newRow.getCell(i - 1).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: {
                                argb: 'FFFFFF00'
                            },
                            bgColor: {
                                argb: 'FF0000FF'
                            }
                        };
                        newRow.getCell(i - 2).fill = {
                            type: 'pattern',
                            pattern: 'darkTrellis',
                            fgColor: {
                                argb: 'FFFFFF00'
                            },
                            bgColor: {
                                argb: 'FF0000FF'
                            }
                        };
                    }
                }



            })

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

            // const lastColumn = sheet.columns[sheet.columns.length - 1]
            // sheet.getCell(lastColumn.letter + '2').value = 'TOTAL DAYS'
            // sheet.getCell(sheet.getColumn(lastColumn.number + 1).letter + '2').value = 'DAYS WORKED'
            // sheet.getCell(sheet.getColumn(lastColumn.number + 2).letter + '2').value = 'TOTAL HOURS WORKED'

            console.log(sheet)
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