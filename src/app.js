import * as login from './assests/js/login';

const config = {
  apiKey: 'AIzaSyA4s7gp7SFid_by1vLVZDmcKbkEcsStBAo',
  authDomain: 'growthfile-adminpanel.firebaseapp.com',
  projectId: 'growthfile-207204',
  messagingSenderId: '701025551237'
}

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

firebase.initializeApp(config)
window.addEventListener('load',function(){
    login.initApp()
})