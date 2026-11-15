const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const tabViewport = document.querySelector('.tab-viewport');
const motionButton = document.querySelector('.motion-toggle');
const motionLabel = document.querySelector('.motion-toggle__label');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const routeStops = {
  ifb: {
    number: '01',
    type: 'Ponto de partida e retorno',
    title: 'IFB Campus Planaltina',
    copy: 'Planejamento, preparação, orientações, organização dos registros e avaliação final.',
    focus: 'Preparar · registrar · avaliar',
  },
  maua: {
    number: '02',
    type: 'Território de chegada',
    title: 'Praça Mauá',
    copy: 'Conexão entre equipamentos culturais e ponto de leitura da paisagem urbana e portuária.',
    focus: 'Território · circulação · cidade',
  },
  amanha: {
    number: '03',
    type: 'Ciência, sociedade e futuro',
    title: 'Museu do Amanhã',
    copy: 'Visita orientada para aproximar ciência, sustentabilidade, escolhas coletivas e possibilidades de futuro.',
    focus: 'Ciência · ambiente · futuros',
  },
  mar: {
    number: '04',
    type: 'Arte e história urbana',
    title: 'Museu de Arte do Rio',
    copy: 'Contato com exposições e narrativas que relacionam arte, memória, identidade e transformações do Rio.',
    focus: 'Arte · identidade · memória',
  },
  ccbb: {
    number: '05',
    type: 'Centro cultural',
    title: 'CCBB',
    copy: 'Experiência em um espaço de circulação artística, patrimônio arquitetônico e diversidade de linguagens.',
    focus: 'Patrimônio · exposição · diálogo',
  },
  selaron: {
    number: '06',
    type: 'Cultura em espaço aberto',
    title: 'Escadaria Selarón',
    copy: 'Observação de uma manifestação artística urbana marcada por mosaicos, circulação e apropriação do espaço.',
    focus: 'Arte urbana · encontro · registro',
  },
};

const galleryItems = [
  {
    src: 'assets/hero-1600.webp',
    alt: 'Cena ilustrativa de estudantes e educadores explorando um território cultural urbano do Rio',
    title: 'Cidade como sala de aula',
    caption: 'Imagem ilustrativa criada para o protótipo da plataforma.',
  },
  {
    src: 'assets/vivencias-1600.webp',
    alt: 'Cena ilustrativa de estudantes observando mosaicos e registrando uma vivência cultural',
    title: 'Registros da experiência',
    caption: 'Espaço visual preparado para receber as fotografias autorizadas da imersão.',
  },
  {
    src: 'assets/memorias-1600.webp',
    alt: 'Cena ilustrativa de estudantes observando fotografias históricas em um centro cultural',
    title: 'Patrimônio e identidade',
    caption: 'A memória aparece como uma camada viva de leitura do território.',
  },
  {
    src: 'assets/saberes-1600.webp',
    alt: 'Cena ilustrativa de estudantes interagindo com uma exposição sobre ciência, ambiente e futuro',
    title: 'Saberes para o futuro',
    caption: 'Biologia, Agronomia e Agroecologia em diálogo com cultura e sociedade.',
  },
];

let activeTab = 'inicio';
let galleryIndex = 0;
let lastGalleryTrigger = null;

function setMotionPreference(reduced, persist = true) {
  document.body.dataset.motion = reduced ? 'reduced' : 'full';
  motionButton.setAttribute('aria-pressed', String(reduced));
  motionButton.setAttribute('aria-label', reduced ? 'Ativar movimento' : 'Reduzir movimento');
  motionLabel.textContent = reduced ? 'Ativar movimento' : 'Reduzir movimento';
  motionButton.querySelector('.motion-toggle__icon').textContent = reduced ? '◉' : '◎';
  if (persist) localStorage.setItem('rio-motion', reduced ? 'reduced' : 'full');
}

const savedMotion = localStorage.getItem('rio-motion');
setMotionPreference(savedMotion ? savedMotion === 'reduced' : prefersReduced.matches, false);

motionButton.addEventListener('click', () => {
  setMotionPreference(document.body.dataset.motion !== 'reduced');
});

function activateTab(id, shouldFocus = false) {
  const nextTab = tabs.find((tab) => tab.dataset.tab === id);
  const nextPanel = panels.find((panel) => panel.dataset.panel === id);
  if (!nextTab || !nextPanel) return;

  activeTab = id;
  tabs.forEach((tab) => {
    const selected = tab === nextTab;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    const selected = panel === nextPanel;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
  });

  history.replaceState(null, '', `#${id}`);
  tabViewport.scrollTo({
    left: nextTab.offsetLeft - (tabViewport.clientWidth - nextTab.offsetWidth) / 2,
    behavior: document.body.dataset.motion === 'reduced' ? 'auto' : 'smooth',
  });
  if (shouldFocus) nextTab.focus({ preventScroll: true });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      activateTab(tabs[nextIndex].dataset.tab, true);
    }
  });
});

document.querySelectorAll('[data-goto]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    activateTab(button.dataset.goto);
    window.scrollTo({ top: 0, behavior: document.body.dataset.motion === 'reduced' ? 'auto' : 'smooth' });
  });
});

function initializeTilt() {
  document.querySelectorAll('[data-tilt]').forEach((element) => {
    const strength = Number(element.dataset.tiltStrength || 0.33);
    element.addEventListener('pointermove', (event) => {
      if (document.body.dataset.motion === 'reduced' || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.setProperty('--ry', `${x * 10 * strength}deg`);
      element.style.setProperty('--rx', `${y * -9 * strength}deg`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--rx', '0deg');
      element.style.setProperty('--ry', '0deg');
    });
  });
}

initializeTilt();

const routeCard = document.querySelector('.route-card');
const routeNodes = [...document.querySelectorAll('.route-node')];

routeNodes.forEach((node) => {
  node.addEventListener('click', () => {
    const stop = routeStops[node.dataset.stop];
    if (!stop) return;
    routeNodes.forEach((item) => item.classList.toggle('is-active', item === node));
    routeCard.classList.remove('route-card--changed');
    requestAnimationFrame(() => {
      routeCard.querySelector('.route-card__number').textContent = stop.number;
      routeCard.querySelector('.route-card__type').textContent = stop.type;
      routeCard.querySelector('.route-card__title').textContent = stop.title;
      routeCard.querySelector('.route-card__copy').textContent = stop.copy;
      routeCard.querySelector('.route-card__focus b').textContent = stop.focus;
      routeCard.classList.add('route-card--changed');
    });
  });
});

const dialog = document.querySelector('.lightbox');
const dialogImage = dialog.querySelector('img');
const dialogTitle = dialog.querySelector('h2');
const dialogCaption = dialog.querySelector('figcaption p');
const dialogIndex = dialog.querySelector('.lightbox__index');

function renderGalleryItem(index) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[galleryIndex];
  dialogImage.src = item.src;
  dialogImage.alt = item.alt;
  dialogTitle.textContent = item.title;
  dialogCaption.textContent = item.caption;
  dialogIndex.textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
}

document.querySelectorAll('[data-gallery]').forEach((button) => {
  button.addEventListener('click', () => {
    lastGalleryTrigger = button;
    renderGalleryItem(Number(button.dataset.gallery));
    dialog.showModal();
    dialog.querySelector('.lightbox__close').focus();
  });
});

dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox__nav--prev').addEventListener('click', () => renderGalleryItem(galleryIndex - 1));
dialog.querySelector('.lightbox__nav--next').addEventListener('click', () => renderGalleryItem(galleryIndex + 1));

dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

dialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') renderGalleryItem(galleryIndex - 1);
  if (event.key === 'ArrowRight') renderGalleryItem(galleryIndex + 1);
});

dialog.addEventListener('close', () => lastGalleryTrigger?.focus());

window.addEventListener('hashchange', () => {
  const requested = location.hash.replace('#', '');
  if (requested && requested !== activeTab) activateTab(requested);
});

const initialTab = location.hash.replace('#', '');
if (tabs.some((tab) => tab.dataset.tab === initialTab)) activateTab(initialTab);

tabViewport.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && tabViewport.scrollWidth > tabViewport.clientWidth) {
    tabViewport.scrollLeft += event.deltaY;
  }
}, { passive: true });
