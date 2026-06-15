// Component: Shared Pagination Controls Manager

/**
 * Renders pagination controls into a target container.
 * @param {HTMLElement} containerEl - The DOM container element to render into.
 * @param {number} currentPage - The current active page (1-indexed).
 * @param {number} totalCount - The total number of items returned by the API.
 * @param {function} onPageChange - Callback invoked when a page button is clicked. Receives (newPageNumber).
 */
export function renderPagination(containerEl, currentPage, totalCount, onPageChange) {
  if (!containerEl) return;

  const totalPages = Math.ceil(totalCount / 15);

  if (totalPages <= 1) {
    containerEl.style.display = 'none';
    containerEl.innerHTML = '';
    return;
  }

  containerEl.style.display = 'flex';
  containerEl.innerHTML = '';

  // 1. Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
    Trước
  `;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  containerEl.appendChild(prevBtn);

  // 2. Page Info
  const pageInfo = document.createElement('span');
  pageInfo.className = 'pagination-info';
  pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
  containerEl.appendChild(pageInfo);

  // 3. Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.innerHTML = `
    Sau
    <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; margin-left: 4px;"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
  `;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  containerEl.appendChild(nextBtn);
}
