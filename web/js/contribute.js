const CONFIG_URL = '../data/contrib-config.json';

const form = document.getElementById('contrib-form');
const successEl = document.getElementById('contrib-success');
const errorEl = document.getElementById('contrib-error');
const submitBtn = document.getElementById('contrib-submit');

let config = { form_endpoint: '', operator_email: '' };

async function loadConfig() {
  try {
    const res = await fetch(CONFIG_URL);
    if (res.ok) config = { ...config, ...(await res.json()) };
  } catch {
    /* 使用默认空配置 */
  }
}

function collectData() {
  const fd = new FormData(form);
  const relation = fd.get('relation_type');
  return {
    _subject: `[案例库推荐] ${fd.get('target_company') || '新案例'} — ${fd.get('submitter_name')}`,
    submitter_name: fd.get('submitter_name')?.trim(),
    submitter_email: fd.get('submitter_email')?.trim(),
    submitter_org: fd.get('submitter_org')?.trim() || '—',
    submitter_phone: fd.get('submitter_phone')?.trim() || '—',
    submitter_role: fd.get('submitter_role')?.trim() || '—',
    relation_type: relation === 'self' ? '自身企业经历' : '所知的第三方企业案例',
    country: fd.get('country')?.trim(),
    target_company: fd.get('target_company')?.trim(),
    investor: fd.get('investor')?.trim(),
    sector: fd.get('sector')?.trim() || '—',
    deal_type: fd.get('deal_type')?.trim() || '—',
    decision_date: fd.get('decision_date')?.trim() || '—',
    outcome: fd.get('outcome')?.trim() || '—',
    summary: fd.get('summary')?.trim(),
    sources: fd.get('sources')?.trim() || '—',
    notes: fd.get('notes')?.trim() || '—',
    submitted_at: new Date().toISOString(),
  };
}

function formatPlainText(data) {
  return [
    '【案例库 — 用户推荐登记表】',
    '',
    '—— 推荐人信息 ——',
    `姓名：${data.submitter_name}`,
    `邮箱：${data.submitter_email}`,
    `机构：${data.submitter_org}`,
    `电话：${data.submitter_phone}`,
    `职务：${data.submitter_role}`,
    `推荐类型：${data.relation_type}`,
    '',
    '—— 案例信息 ——',
    `涉及国家/地区：${data.country}`,
    `目标企业：${data.target_company}`,
    `中方投资者：${data.investor}`,
    `行业：${data.sector}`,
    `交易类型：${data.deal_type}`,
    `决定/发生时间：${data.decision_date}`,
    `审查结果（若已知）：${data.outcome}`,
    '',
    '案例简述：',
    data.summary,
    '',
    `公开来源链接：${data.sources}`,
    `补充说明：${data.notes}`,
    '',
    `提交时间：${data.submitted_at}`,
  ].join('\n');
}

async function submitToEndpoint(data) {
  const res = await fetch(config.form_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `提交失败 (${res.status})`);
  }
}

async function submitViaFormSubmit(data, email) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: data._subject,
      _replyto: data.submitter_email,
      _template: 'table',
      name: data.submitter_name,
      email: data.submitter_email,
      phone: data.submitter_phone,
      organization: data.submitter_org,
      role: data.submitter_role,
      relation_type: data.relation_type,
      country: data.country,
      target_company: data.target_company,
      investor: data.investor,
      sector: data.sector,
      deal_type: data.deal_type,
      decision_date: data.decision_date,
      outcome: data.outcome,
      message: formatPlainText(data),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json.success !== 'true' && json.success !== true)) {
    throw new Error(json.message || '提交失败，请稍后重试');
  }
}

function submitViaMailto(data) {
  const email = config.operator_email?.trim();
  if (!email) throw new Error('表单服务尚未配置，请联系案例库运营团队');
  const body = encodeURIComponent(formatPlainText(data));
  const subject = encodeURIComponent(data._subject);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function showSuccess() {
  form.classList.add('hidden');
  errorEl.classList.add('hidden');
  successEl.classList.remove('hidden');
  successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');

  if (!form.reportValidity()) return;

  const honeypot = form.querySelector('[name="_gotcha"]');
  if (honeypot?.value) return;

  const data = collectData();
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中…';

  try {
    if (config.form_endpoint?.trim()) {
      await submitToEndpoint(data);
      showSuccess();
    } else if (config.operator_email?.trim()) {
      try {
        await submitViaFormSubmit(data, config.operator_email.trim());
        showSuccess();
      } catch {
        submitViaMailto(data);
        document.getElementById('contrib-success-note').textContent =
          '在线提交未成功，已为您打开邮件客户端。请将邮件发送至案例库运营团队，发送后我们会与您联系核实。';
        showSuccess();
      }
    } else {
      try {
        await navigator.clipboard.writeText(formatPlainText(data));
      } catch {
        /* 无法复制时仍显示成功说明 */
      }
      showSuccess();
      document.getElementById('contrib-success-note').textContent =
        '在线表单接收尚未配置。请复制下方信息发送至案例库运营邮箱，或联系运营团队；我们收到后会与您联系核实。';
    }
  } catch (err) {
    showError(err.message || '提交失败，请稍后重试或直接联系运营团队');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '提交推荐';
  }
});

loadConfig();
