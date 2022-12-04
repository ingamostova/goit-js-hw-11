import { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

const BASE_URL = 'https://pixabay.com/api/';
const KEY_URL = 'key=31781224-f2235db9c919ebb7ef96866ff';
let total = 0;
refs.btnLoadMore.hidden = true;
let page = 1;

// async function fetchPictures(picture) {
//   const resp = await fetch(
//     `${BASE_URL}?${KEY_URL}&q=${picture}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
//   );
//   const data = await resp.json();
//   console.log(data);
//   page += 1;
//   total += data.hits.length;
//   console.log(total);
//   return data;
// }

async function fetchPictures(picture) {
  try {
    const response = await axios.get(
      `${BASE_URL}?${KEY_URL}&q=${picture}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    page += 1;
    total += response.data.hits.length;
    return response.data;
  } catch (error) {
    Notify.failure(error.message);
  }
}

refs.form.addEventListener('submit', onSubmit);
refs.btnLoadMore.addEventListener('click', onLoadMore);

function onSubmit(evt) {
  evt.preventDefault();
  refs.btnLoadMore.hidden = true;
  clearMarkup();
  page = 1;
  total = 0;

  fetchPictures(refs.form.elements.searchQuery.value).then(data => {
    if (!data.hits.length) {
      throw new Error(
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        )
      );
    } else {
      createMarkup(data.hits);
      refs.btnLoadMore.hidden = false;
      lightbox.refresh();
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
  });
}

function onLoadMore() {
  fetchPictures(refs.form.elements.searchQuery.value).then(data => {
    createMarkup(data.hits);
    lightbox.refresh();
    if (total >= data.totalHits) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      refs.btnLoadMore.hidden = true;
    }
  });
}

function createMarkup(arr) {
  const markup = arr
    .map(
      item => `<div class="photo-card">
<div class="thumb"><a href="${item.largeImageURL}"><img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" /></a></div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> <span>${item.likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b> <span>${item.views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b> <span>${item.comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b> <span>${item.downloads}</span>
    </p>
  </div>
</div>`
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

const lightbox = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionDelay: 250,
});
