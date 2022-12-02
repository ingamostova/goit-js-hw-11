import { Notify } from 'notiflix';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

refs.btnLoadMore.hidden = true;
let page = 1;
const BASE_URL = 'https://pixabay.com/api/';
const KEY_URL = 'key=31781224-f2235db9c919ebb7ef96866ff';

async function fetchPictures(picture) {
  const resp = await fetch(
    `${BASE_URL}?${KEY_URL}&q=${picture}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
  const data = await resp.json();
  console.log(data);
  page += 1;
  return data.hits;
}

refs.form.addEventListener('submit', onSubmit);
refs.btnLoadMore.addEventListener('click', onLoadMore);

function onSubmit(evt) {
  evt.preventDefault();
  refs.btnLoadMore.hidden = true;
  clearMarkup();
  page = 1;
  fetchPictures(refs.form.elements.searchQuery.value).then(data => {
    if (!data.length) {
      throw new Error(
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        )
      );
    } else {
      createMarkup(data);
      refs.btnLoadMore.hidden = false;
    }
  });
}

function onLoadMore() {
  fetchPictures(refs.form.elements.searchQuery.value).then(createMarkup);
}

function createMarkup(arr) {
  const markup = arr
    .map(
      item => `<div class="photo-card">
  <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${item.likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${item.views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${item.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${item.downloads}</b>
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
