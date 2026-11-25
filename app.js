const config = window.PLAN_CONFIG;
const form = document.querySelector('#login-form');
const login = document.querySelector('#login');
const plan = document.querySelector('#plan');
const logout = document.querySelector('#logout');
const notice = document.querySelector('#notice');
let session;
let pending = Promise.resolve();
const configured = /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(config.url)
  && /^sb_publishable_[A-Za-z0-9_-]+$/.test(config.key);
if (!configured) notice.textContent = 'Önce config.js dosyasını ayarla.';

async function request(path, options = {}, token = session?.access_token) {
  const response = await fetch(config.url + path, {
    ...options,
    cache: 'no-store',
    headers: {
      apikey: config.key,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.status === 204 || response.headers.get('content-length') === '0'
    ? null : response.text().then(text => text ? JSON.parse(text) : null);
}

function closePlan(message = '') {
  session = undefined;
  plan.replaceChildren();
  plan.hidden = true;
  login.hidden = false;
  logout.hidden = true;
  notice.textContent = message;
}

function save(key, value) {
  const activeSession = session;
  notice.textContent = 'Kaydediliyor…';
  pending = pending.then(async () => {
    if (activeSession !== session || !activeSession) return;
    try {
      await request('/rest/v1/final_plan_progress?on_conflict=owner_id,key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ owner_id: activeSession.user.id, key, value })
      });
      notice.textContent = 'Kaydedildi.';
    } catch (error) {
      notice.textContent = 'Kaydedilemedi. Oturumun süresi dolmuş olabilir. Yeniden giriş yap.';
    }
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!configured) return;
  const button = form.querySelector('button');
  button.disabled = true;
  notice.textContent = 'Giriş yapılıyor…';
  const { email, password } = Object.fromEntries(new FormData(form));
  form.elements.password.value = '';
  try {
    session = await request('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
  } catch {
    closePlan('Giriş başarısız. E-posta ve şifreyi kontrol et.');
    button.disabled = false;
    return;
  }
  try {
    const [rows, progress] = await Promise.all([
      request('/rest/v1/final_plan_documents?select=body&limit=1'),
      request('/rest/v1/final_plan_progress?select=key,value')
    ]);
    if (rows.length !== 1) throw new Error('not authorized');
    // This markup is writable only from the private project's SQL editor.
    plan.innerHTML = rows[0].body;
    setupPlan(Object.fromEntries(progress.map(item => [item.key, item.value])));
    login.hidden = true;
    logout.hidden = false;
    plan.hidden = false;
    notice.textContent = '';
  } catch {
    closePlan('Bu hesapla çalışma planı açılamadı.');
  } finally {
    button.disabled = false;
  }
});
logout.addEventListener('click', async () => {
  logout.disabled = true;
  await pending;
  try { await request('/auth/v1/logout', { method: 'POST' }); } catch {}
  closePlan();
  logout.disabled = false;
});

function setupPlan(state) {
const boxes=[...document.querySelectorAll('.task input')];
function progress(){let total=0;for(const box of boxes){box.closest('.task').classList.toggle('done',box.checked);if(box.checked) total++;}document.querySelector('#status').textContent=total+' / '+boxes.length+' görev';document.querySelector('#meter').value=total;}
for(const box of boxes){box.checked=Boolean(state[box.id]);box.addEventListener('change',()=>{state[box.id]=box.checked;save(box.id, box.checked);progress();});}
progress();
const buttons=[...document.querySelectorAll('[data-week]')];
function show(i){for(const button of buttons){const selected=button.dataset.week===String(i);button.setAttribute('aria-pressed',selected);document.getElementById(button.getAttribute('aria-controls')).classList.toggle('active',selected);}}
for(const button of buttons)button.addEventListener('click',()=>{state.week=button.dataset.week;show(state.week);});
if(buttons.some(b=>b.dataset.week===state.week))show(state.week);
const dates=[...document.querySelectorAll('[data-exam]')];
const format=new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'UTC'});
function showDates(){const entered=dates.filter(d=>d.value&&d.validity.valid).sort((a,b)=>a.value.localeCompare(b.value));const list=document.querySelector('#exam-list');list.replaceChildren();for(const d of entered){const li=document.createElement('li');li.textContent=format.format(new Date(d.value+'T00:00:00Z'))+' · '+d.labels[0].textContent.trim();list.append(li);}document.querySelector('#exam-empty').hidden=entered.length>0;}
for(const d of dates){const id='exam-'+d.dataset.exam;d.value=state[id]||'';d.addEventListener('change',()=>{state[id]=d.value;save(id, d.value);showDates();});}
showDates();

}
