let store = {
  user: { name: "Student" },
  apod: '',
  rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
  store = Object.assign(store, newState)
  render(root, store)
}

const render = async (root, state) => {
  root.innerHTML = App(state)
  createListeners(state.rovers)
}

// create content
const App = (state) => {
  let { rovers, apod } = state

  return `
    <header></header>
    <main>
      <h1>MARS Rover Dashboard</h1>
      <section>
        ${ImageOfTheDay(apod)}
        <h2> Select a Rover to view its latest photos and information </h2>
        <div id="buttons">${renderHTML(roverButton,rovers)}</div>
        <br><br>
        <div id="info"></div>
        <br>
        <div id="gallery" class="gallery"></div>
      </section>
    </main>
    <footer></footer>
  `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store)
})

const createListeners = (rovers) => {
  rovers.forEach(async r => {
    // Add manifests to store
    const manifest = await getManifest(r);
    Object.assign(store, {[r]: manifest});
    // Add tables with manifest info, hidden by default
    $('#info').append( renderHTML(infoTable,manifest) )
    // Button listeners for reover selection
    $(`#${r}`).on('click', async function(){
      // Reset button styles and toggle for selected button
      rovers.map(x => $(`#${x}`).addClass('button-alt'));
      $(this).toggleClass('button-alt')
      // Reset info table styles and show selected rover
      $('#info table').css({'display': 'none'});
      $(`#table-${r}`).css({'display': 'flex'});
      // Reset gallery container and generate slideshow for selected rover
      $('#gallery').empty().css({'display': 'block'});
      const album = await getPhotos(r, store[r].max_date)
      Object.assign(store, {['photos']: album.photos})
      Object.assign(store, {['slide']: 0})
      $('#gallery').append(`
        ${renderHTML(imageSlide,store.photos)}
        <a class="prev" onclick="nextSlide(showSlide,-1)">&#10094</a>
        <a class="next" onclick="nextSlide(showSlide,1)">&#10095</a>`
      )
      showSlide(store.slide);
    })
  })
}

// HOF to render items' html
const renderHTML = (func, obj) => {
  if (Array.isArray(obj)) {
    return obj.map(func).join("");
  }

  return func(obj);
}

// Callback to create button elements
const roverButton = (name) => {
  return `<button class="button-on button-alt" type="button" id="${name}">${name}</button>`
}

// Callback to create table with rover manifest data
const infoTable = (manifest) => {
  return `
    <table id="table-${manifest.name}">
      <tbody>
        <tr>
          <td>Launch Date</td>
          <td>${manifest.launch_date}</td>
          <td>Landing Date</td>
          <td>${manifest.landing_date}</td>
          <td>Status</td>
          <td>${manifest.status}</td>
          <td>Latest Photos</td>
          <td>${manifest.max_date}</td>
          <td>Total Photos</td>
          <td>${manifest.total_photos}</td>
        </tr>
      </tbody>
    </table>`
}
// Callback to create image slide with buttons and captions text
const imageSlide = (photo, index, album) => {
  return `
    <div class="img-slide animate">
      <img src="${photo.img_src}">
      <div class="count-text">${index+1} / ${album.length}</div>  
      <div class="caption-text">${photo.camera.name}: ${photo.camera.full_name} photo</div>
    </div>`
}

// HOF for onClick action on image slides
const nextSlide = (showSlide,n) => {
  const newSlide = store.slide += n
  if (newSlide >= store.photos.length) { Object.assign(store, {['slide']: 0})}
  if (newSlide < 0) { Object.assign(store, {['slide']: store.photos.length - 1})}

  showSlide(store.slide);
}

const showSlide = n => {
  $('.img-slide').each(function() { $(this).css('display','none') });
  $('.img-slide')[n].style = 'display:block';
}


// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

  // If image does not already exist, or it is not from today -- request it again
  const today = new Date()
  const photodate = new Date(apod.date)
  // console.log(photodate.getDate(), today.getDate());

  // console.log(photodate.getDate() === today.getDate());
  if (!apod || apod.date === today.getDate() ) {
    getImageOfTheDay(store)
  }

  // check if the photo of the day is actually type video!
  if (apod.media_type === "video") {
    return (`
      <p>See today's featured video <a href="${apod.url}">here</a></p>
      <p>${apod.title}</p>
      <p>${apod.explanation}</p>
    `)
  } else {
    return (`
      <table style="width:100%">
        <tr>
          <td style="width:50%; padding:15px;">
            <h2> Astronomy Pic of the Day </h2>
            <p>${apod.image.explanation}</p></td>    
          <td><img src="${apod.image.url}" style="max-height:500px;max-width:100%;"/></td>
        </tr>
      </table>
    `)
  }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
  let { apod } = state

  fetch(`http://localhost:3000/apod`)
    .then(res => res.json())
    .then(apod => updateStore(store, { apod }))

  // return data
}

async function getManifest(rover) {
  try {
    const response = await fetch(`http://localhost:3000/manifest?rover=${rover.toLowerCase()}`);
    if (!response.ok) { throw new Error(`HTTP Error: ${response.status}`); }
    const { manifest } = await response.json();
    return manifest;
  } catch (err) {
    console.error(`Could not get manifest: ${err}`); 
  }
}

async function getPhotos(rover,date) {
  try {
    // console.log(`Looking up photos from ${rover} on ${date}`);
    const response = await fetch(`http://localhost:3000/photos?rover=${rover}&date=${date}`);
    if (!response.ok) { throw new Error(`HTTP Error: ${response.status}`); }
    const photoshoot = await response.json();
    return photoshoot;
  } catch (err) {
    console.error(`Could not get photos: ${err}`)
  }
}
