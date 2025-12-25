const state = {
    tagsConfig: [],
    links: [],
    selectedTags: new Set(),
    searchTerm: '',
    palette: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#0EA5E9', '#22C55E', '#F59E0B', '#475569'],
    activeColor: '#3B82F6'
};

const elements = {};

const DATA_SOURCE_URL = './data.json';

function cacheElements() {
    elements.tagBar = document.getElementById('tagBar');
    elements.cardGrid = document.getElementById('cardGrid');
    elements.emptyState = document.getElementById('emptyState');
    elements.clearFiltersBtn = document.getElementById('clearFilters');
    elements.searchInput = document.getElementById('searchInput');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.configBtn = document.getElementById('configBtn');
    elements.configOverlay = document.getElementById('configOverlay');
    elements.configClose = document.getElementById('configClose');
    elements.tagForm = document.getElementById('tagForm');
    elements.tagNameInput = document.getElementById('tagName');
    elements.colorSwatches = document.getElementById('colorSwatches');
    elements.tagColorPicker = document.getElementById('tagColorPicker');
    elements.tagConfigList = document.getElementById('tagConfigList');
    elements.linkForm = document.getElementById('linkForm');
    elements.linkTagCheckboxes = document.getElementById('linkTagCheckboxes');
    elements.jsonOutput = document.getElementById('jsonOutput');
    elements.copyJsonBtn = document.getElementById('copyJson');
    elements.toast = document.getElementById('toast');
}

async function loadData() {
    try {
        const res = await fetch(`${DATA_SOURCE_URL}?v=${Date.now()}`);
        if (!res.ok) throw new Error('无法加载数据');
        const data = await res.json();
        state.tagsConfig = Array.isArray(data.tags_config) ? data.tags_config : [];
        state.links = Array.isArray(data.links) ? data.links : [];
        renderAll();
    } catch (err) {
        console.error(err);
        elements.cardGrid.innerHTML = `<div class="empty-state">数据加载失败，请稍后重试。</div>`;
    }
}

function renderAll() {
    renderTags();
    renderCards();
    renderConfigSection();
    updateJsonOutput();
}

function renderTags() {
    const uniqueTags = new Set(state.tagsConfig.map(t => t.name));
    state.links.forEach(link => (link.tags || []).forEach(tag => uniqueTags.add(tag)));
    const sortedTags = [...uniqueTags]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'zh-Hans'));
    syncedSelectedTags(sortedTags);
    const fragment = document.createDocumentFragment();

    const allBtn = createTagFilterButton('全部', null);
    allBtn.setAttribute('data-filter-all', 'true');
    allBtn.setAttribute('aria-pressed', state.selectedTags.size === 0);
    fragment.appendChild(allBtn);

    sortedTags.forEach(tag => {
        const btn = createTagFilterButton(tag, getTagColor(tag));
        fragment.appendChild(btn);
    });

    elements.tagBar.innerHTML = '';
    elements.tagBar.appendChild(fragment);
}

function syncedSelectedTags(validTags) {
    const set = new Set(validTags);
    [...state.selectedTags].forEach(tag => {
        if (!set.has(tag)) {
            state.selectedTags.delete(tag);
        }
    });
}

function createTagFilterButton(label, color) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-filter';
    btn.dataset.tag = label;
    const isActive = state.selectedTags.has(label);
    btn.setAttribute('aria-pressed', isActive);
    btn.innerHTML = `<span class="tag-dot" style="background:${color || 'var(--tag-default)'}"></span><span>${label}</span>`;
    btn.addEventListener('click', () => {
        if (btn.dataset.filterAll) {
            state.selectedTags.clear();
        } else {
            if (state.selectedTags.has(label)) {
                state.selectedTags.delete(label);
            } else {
                state.selectedTags.add(label);
            }
        }
        renderTags();
        renderCards();
    });
    return btn;
}

function renderCards() {
    const cards = state.links.filter(filterByTags).filter(filterBySearch);
    elements.cardGrid.innerHTML = '';

    cards.forEach(link => {
        const card = document.createElement('article');
        card.className = 'link-card';

        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'card-action-btn';
        copyBtn.type = 'button';
        copyBtn.textContent = '复制';
        copyBtn.title = '复制链接';
        copyBtn.addEventListener('click', () => copyToClipboard(link.url));

        const editAnchor = document.createElement('a');
        editAnchor.className = 'card-action-btn';
        editAnchor.href = getEditLink();
        editAnchor.target = '_blank';
        editAnchor.rel = 'noopener noreferrer';
        editAnchor.textContent = '编辑';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-action-btn danger';
        deleteBtn.type = 'button';
        deleteBtn.textContent = '删除';
        deleteBtn.title = '删除收藏';
        deleteBtn.addEventListener('click', () => {
            const confirmed = confirm(`确定删除“${link.title || '未命名收藏'}”？`);
            if (confirmed) deleteLink(link);
        });

        actions.append(copyBtn, editAnchor, deleteBtn);

        const heading = document.createElement('h3');
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.title || '未命名收藏';
        heading.appendChild(anchor);

        const desc = document.createElement('p');
        desc.textContent = link.desc || '暂无简介';

        const tagsRow = document.createElement('div');
        tagsRow.className = 'tag-row';
        (link.tags || []).forEach(tag => {
            tagsRow.appendChild(createTagChip(tag));
        });

        card.append(actions, heading, desc, tagsRow);
        elements.cardGrid.appendChild(card);
    });

    const hasResults = cards.length > 0;
    elements.emptyState.hidden = hasResults;
    elements.cardGrid.hidden = !hasResults;
}

function getEditLink() {
    return 'https://github.com/GLoryforRichard/GLoryforRichard.github.io/blob/master/data.json';
}

function createTagChip(tag) {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    const color = getTagColor(tag) || 'var(--tag-default)';
    chip.style.borderColor = color;
    const dot = document.createElement('span');
    dot.className = 'tag-dot';
    dot.style.background = color;
    chip.append(dot, document.createTextNode(tag));
    return chip;
}

function getTagColor(tagName) {
    const item = state.tagsConfig.find(tag => tag.name === tagName);
    return item ? item.color : null;
}

function filterByTags(link) {
    if (state.selectedTags.size === 0) return true;
    const tags = new Set(link.tags || []);
    return [...state.selectedTags].every(tag => tags.has(tag));
}

function filterBySearch(link) {
    if (!state.searchTerm) return true;
    const term = state.searchTerm.toLowerCase();
    const haystack = [link.title, link.desc, ...(link.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return haystack.includes(term);
}

function setupSearch() {
    elements.searchInput.addEventListener('input', e => {
        state.searchTerm = e.target.value.trim();
        renderCards();
    });

    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            elements.searchInput.focus();
        }
        if (e.key === 'Escape') {
            closeConfigPanel();
        }
    });
}

function setupClearFilters() {
    elements.clearFiltersBtn.addEventListener('click', () => {
        state.selectedTags.clear();
        state.searchTerm = '';
        elements.searchInput.value = '';
        renderTags();
        renderCards();
    });
}

function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    setTheme(theme);

    elements.themeToggle.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    elements.themeToggle.querySelector('.icon').textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

function setupConfigPanel() {
    elements.configBtn.addEventListener('click', openConfigPanel);
    elements.configClose.addEventListener('click', closeConfigPanel);
    elements.configOverlay.addEventListener('click', e => {
        if (e.target === elements.configOverlay) {
            closeConfigPanel();
        }
    });
}

function openConfigPanel() {
    elements.configOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeConfigPanel() {
    elements.configOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function renderColorPalette() {
    elements.colorSwatches.innerHTML = '';
    state.palette.forEach(color => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.color = color;
        swatch.dataset.color = color;
        if (state.activeColor === color) {
            swatch.dataset.selected = 'true';
        }
        swatch.addEventListener('click', () => {
            state.activeColor = color;
            renderColorPalette();
        });
        elements.colorSwatches.appendChild(swatch);
    });
    const customBtn = document.createElement('button');
    customBtn.type = 'button';
    customBtn.className = 'color-swatch add-swatch';
    customBtn.textContent = '+';
    customBtn.addEventListener('click', () => elements.tagColorPicker.click());
    elements.colorSwatches.appendChild(customBtn);
}

function setupColorPicker() {
    elements.tagColorPicker.addEventListener('input', e => {
        state.activeColor = e.target.value;
        if (!state.palette.includes(state.activeColor)) {
            state.palette.push(state.activeColor);
        }
        renderColorPalette();
    });
}

function handleTagForm() {
    elements.tagForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = elements.tagNameInput.value.trim();
        if (!name) return;
        const color = state.activeColor || '#e5e7eb';
        const idx = state.tagsConfig.findIndex(item => item.name === name);
        if (idx > -1) {
            state.tagsConfig[idx].color = color;
        } else {
            state.tagsConfig.push({ name, color });
        }
        elements.tagForm.reset();
        renderAll();
    });
}

function renderConfigSection() {
    renderTagConfigList();
    renderTagCheckboxes();
}

function renderTagConfigList() {
    elements.tagConfigList.innerHTML = '';
    state.tagsConfig.forEach(item => {
        const node = document.createElement('div');
        node.className = 'config-item';
        node.innerHTML = `<span class="tag-dot" style="background:${item.color}"></span>${item.name}`;
        elements.tagConfigList.appendChild(node);
    });
}

function renderTagCheckboxes() {
    elements.linkTagCheckboxes.innerHTML = '';
    const tags = state.tagsConfig.map(t => t.name);
    if (!tags.length) {
        elements.linkTagCheckboxes.textContent = '请先创建标签。';
        return;
    }
    tags.forEach(tag => {
        const label = document.createElement('label');
        label.className = 'tag-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = tag;
        label.appendChild(checkbox);
        label.append(tag);
        elements.linkTagCheckboxes.appendChild(label);
    });
}

function handleLinkForm() {
    elements.linkForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        if (!title || !url) return;
        const desc = document.getElementById('linkDesc').value.trim();
        const tags = [...elements.linkTagCheckboxes.querySelectorAll('input:checked')].map(input => input.value);
        state.links.unshift({ title, url, desc, tags });
        elements.linkForm.reset();
        renderAll();
    });
}

function updateJsonOutput() {
    const payload = {
        tags_config: state.tagsConfig,
        links: state.links
    };
    elements.jsonOutput.value = JSON.stringify(payload, null, 2);
}

function deleteLink(target) {
    state.links = state.links.filter(link => link !== target);
    renderAll();
    showToast('收藏已删除');
}

function setupJsonCopy() {
    elements.copyJsonBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(elements.jsonOutput.value)
            .then(() => showToast('JSON 已复制'))
            .catch(() => showToast('复制失败，请手动复制'));
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('链接已复制'))
        .catch(() => showToast('复制失败'));
}

let toastTimer;
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        elements.toast.hidden = true;
    }, 1800);
}

function init() {
    cacheElements();
    renderColorPalette();
    setupColorPicker();
    setupSearch();
    setupClearFilters();
    setupConfigPanel();
    handleTagForm();
    handleLinkForm();
    setupJsonCopy();
    initTheme();
    loadData();
}

init();
