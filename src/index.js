import './styles.css';
import { Notify } from 'notiflix';
import axios from 'axios';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('hidden');
const API_KEY = '36027654-0445d5372370fb7cb2fc02c29';
let isFirstSearch = true;
let searchQuery = '';
let previousQuery = '';
let page = 1;

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  searchQuery = e.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notify.failure('Please enter a search query.');
    clearGallery();
    hideLoadMoreBtn();
    return;
  }

  page = 1;
  clearGallery();
  searchImages();
});

async function searchImages() {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    const data = response.data;

    renderImages(data.hits);

    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (
      (isFirstSearch || searchQuery !== previousQuery) &&
      data.totalHits >= page * 40
    ) {
      Notify.success(
        `Hooray! We found ${data.totalHits} images for your query.`
      );
      isFirstSearch = false;
      previousQuery = searchQuery;
    }

    if (data.totalHits <= page * 40) {
      hideLoadMoreBtn();
      Notify.info("We're sorry, but you've reached the end of search results.");
      return;
    } else {
      showLoadMoreBtn();
    }
  } catch (error) {
    Notify.failure('Oops, something went wrong. Please try again later.');
  }
}

function renderImages(images) {
  const galleryHTML = images
    .map(image => {
      return `
        <div class="photo-card">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
        <p class="info-item">
        <b>Likes</b> ${image.likes}
        </p>
        <p class="info-item">
        <b>Views</b> ${image.views}
        </p>
        <p class="info-item">
        <b>Comments</b> ${image.comments}
        </p>
        <p class="info-item">
        <b>Downloads</b> ${image.downloads}
        </p>
        </div>
        </div>
        `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', galleryHTML);
}

function clearGallery() {
  gallery.innerHTML = '';
  hideLoadMoreBtn();
}

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  searchImages();
});

function showLoadMoreBtn() {
  loadMoreBtn.classList.remove('hidden');
}

function hideLoadMoreBtn() {
  loadMoreBtn.classList.add('hidden');
}
