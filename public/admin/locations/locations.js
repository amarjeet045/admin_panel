const container = document.querySelector('.fabs');

const init = (office,officeId) => {

}

container.children[0].addEventListener('click', (ev) => {
  redirect('/admin/locations/customer')
})
container.children[1].addEventListener('click', (ev) => {
    redirect('/admin/locations/branch')
})

container.children[2].addEventListener('click', (ev) => {
    toggleFabList(ev.currentTarget)
})