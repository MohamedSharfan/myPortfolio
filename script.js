//navbar javascript
function toggleMenu(){
    let togMenu=document.querySelector('.toggle');
    let menu=document.querySelector('.menu');
    togMenu.classList.toggle('active');
    menu.classList.toggle('active');
}

const sr =ScrollReveal({
    origin:'top',
    distance:'85px',
    duration:1500,
    reset:true
})
sr.reveal('.about-heading',{})
sr.reveal('.home-image',{delay:200})


sr.reveal('.home-text',{})
sr.reveal('.photo',{})
sr.reveal('.about-content',{})

sr.reveal('.interest-heading',{})
sr.reveal('.interest-image',{})
sr.reveal('.interest-content',{})

sr.reveal('.skill-heading',{})
sr.reveal('.skill-wrapper',{})
