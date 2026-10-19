// When served by Express the API is on the same origin.
// When index.html is opened straight from disk, point at the local server.
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
const API_URL = API_BASE + '/api/products';

const form = document.getElementById('product-form');
const rows = document.getElementById('product-rows');
const emptyNote = document.getElementById('empty');
const message = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');

const fields = ['product_name', 'brand', 'category', 'price', 'stock_quantity', 'description'];
const el = (id) => document.getElementById(id);

function showMessage(text, type) {
  message.textContent = text;
  message.className = type || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

async function loadProducts() {
  try {
    const products = await request(API_URL);
    renderTable(products);
  } catch (err) {
    showMessage('Could not load products: ' + err.message, 'error');
  }
}

function renderTable(products) {
  emptyNote.hidden = products.length > 0;
  rows.innerHTML = products.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.product_name)}</td>
      <td>${escapeHtml(p.brand)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td class="num">$${Number(p.price).toFixed(2)}</td>
      <td class="num">${p.stock_quantity}</td>
      <td>${escapeHtml(p.description)}</td>
      <td>${escapeHtml(p.updated_at)}</td>
      <td class="row-actions">
        <button type="button" class="secondary" data-action="edit" data-id="${p.id}">Edit</button>
        <button type="button" class="danger" data-action="delete" data-id="${p.id}">Delete</button>
      </td>
    </tr>`).join('');
}

function resetForm() {
  form.reset();
  el('product-id').value = '';
  formTitle.textContent = 'Add a product';
  saveBtn.textContent = 'Add product';
  cancelBtn.hidden = true;
}

async function startEdit(id) {
  try {
    const p = await request(API_URL + '/' + id);
    fields.forEach((f) => { el(f).value = p[f] ?? ''; });
    el('product-id').value = p.id;
    formTitle.textContent = 'Edit product #' + p.id;
    saveBtn.textContent = 'Save changes';
    cancelBtn.hidden = false;
    showMessage('', '');
    form.scrollIntoView({ behavior: 'smooth' });
    el('product_name').focus();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete product #' + id + '?')) return;
  try {
    await request(API_URL + '/' + id, { method: 'DELETE' });
    showMessage('Product deleted.', 'ok');
    if (el('product-id').value === String(id)) resetForm();
    loadProducts();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = el('product-id').value;
  const body = {};
  fields.forEach((f) => { body[f] = el(f).value; });

  try {
    await request(id ? API_URL + '/' + id : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    showMessage(id ? 'Changes saved.' : 'Product added.', 'ok');
    resetForm();
    loadProducts();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

rows.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'edit') startEdit(id);
  if (btn.dataset.action === 'delete') deleteProduct(id);
});

cancelBtn.addEventListener('click', () => {
  resetForm();
  showMessage('', '');
});

loadProducts();
