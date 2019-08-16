import * as login from './assests/js/login';
import {firebaseConfig} from './env-config';


moment.locale('en', {
  calendar: {
    lastDay: '[yesterday]',
    sameDay: 'LT',
    nextDay: '[Tomorrow at] LT',
    lastWeek: 'dddd',
    nextWeek: 'dddd [at] LT',
    sameElse: 'L'
  },

  months: [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ]

})

firebase.initializeApp(firebaseConfig())
window.addEventListener('load', function () {
  login.initApp()
})
