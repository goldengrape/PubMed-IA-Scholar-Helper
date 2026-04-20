const ROOT_ATTR = 'data-ia-scholar-root';

init();

function init() {
  const start = () => {
    mountOrMoveUi();
    window.setTimeout(mountOrMoveUi, 500);
    window.setTimeout(mountOrMoveUi, 1500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('pageshow', mountOrMoveUi);
}

function mountOrMoveUi() {
  let root = document.querySelector(`[${ROOT_ATTR}]`);
  if (!(root instanceof HTMLElement)) {
    root = createUi();
  }

  const target = findTargetContainer();
  if (target) {
    if (root.parentElement !== target) {
      target.appendChild(root);
    }
    root.classList.remove('ia-floating');
  } else {
    if (root.parentElement !== document.body) {
      document.body.appendChild(root);
    }
    root.classList.add('ia-floating');
  }

  render(root);
}

function createUi() {
  const wrapper = document.createElement('section');
  wrapper.setAttribute(ROOT_ATTR, 'true');
  wrapper.innerHTML = `
    <div class="ia-card">
      <div class="ia-eyebrow">Internet Archive Scholar</div>
      <div class="ia-title">Find in Internet Archive Scholar</div>
      <div class="ia-meta" data-role="meta"></div>

      <form class="ia-form" data-role="search-form" action="https://scholar.archive.org/search" method="post" target="_blank">
        <input type="hidden" name="q" value="" data-role="query-input" />
        <button type="submit" class="ia-submit">Find in Internet Archive Scholar</button>
      </form>

      <div class="ia-note" data-role="note"></div>
    </div>
  `;
  return wrapper;
}

function render(root) {
  const input = root.querySelector('[data-role="query-input"]');
  const metaNode = root.querySelector('[data-role="meta"]');
  const noteNode = root.querySelector('[data-role="note"]');
  const submitButton = root.querySelector('.ia-submit');

  const payload = collectArticleInfo();
  const doiQuery = payload.doi ? `doi:${payload.doi}` : '';

  if (input instanceof HTMLInputElement) {
    input.value = doiQuery;
  }

  if (metaNode instanceof HTMLElement) {
    if (payload.doi) {
      metaNode.innerHTML = `<span class="ia-pill">DOI</span><code>${escapeHtml(payload.doi)}</code>`;
    } else {
      metaNode.innerHTML = `<span class="ia-pill ia-pill-muted">DOI unavailable</span>`;
    }
  }

  if (noteNode instanceof HTMLElement) {
    noteNode.textContent = payload.doi
      ? 'Uses a POST search request to open IA Scholar in a new tab.'
      : 'This PubMed page does not expose a DOI, so the button is disabled.';
  }

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = !payload.doi;
  }
}

function findTargetContainer() {
  const fullTextList = document.querySelector('.full-text-links-list');
  if (fullTextList?.parentElement) return fullTextList.parentElement;

  const fullTextBlock = document.querySelector('.full-text-links, .full-view-sidebar');
  if (fullTextBlock instanceof HTMLElement) return fullTextBlock;

  const actionsBlock = document.querySelector('.article-actions');
  if (actionsBlock instanceof HTMLElement) return actionsBlock;

  return null;
}

function collectArticleInfo() {
  const doi = normalizeDoi(findMetaContent('citation_doi') || findDoiNearCitation());
  return { doi };
}

function findMetaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
}

function findDoiNearCitation() {
  const doiLink = document.querySelector('a[href*="doi.org/"]');
  const doiText = doiLink?.textContent || doiLink?.getAttribute('href') || '';
  return doiText.trim();
}

function normalizeDoi(input) {
  if (!input) return '';
  const text = String(input).trim();
  const match = text.match(/10\.\d{4,9}\/[\w.()/:;+\-]+/i);
  return match ? match[0].replace(/[.)\],;]+$/, '') : '';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
