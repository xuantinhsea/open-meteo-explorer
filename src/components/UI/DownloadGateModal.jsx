import { useState, useEffect, useRef } from 'react';
import { getSavedProfile } from '../../utils/downloadTracking';

const PURPOSES = [
  'Academic research',
  'Teaching / student project',
  'Government / public agency',
  'Commercial / consulting',
  'NGO / humanitarian',
  'Personal interest',
  'Other',
];

// Deliberately permissive: this is a contact form, not an auth system. It
// catches typos like a missing @ or a trailing space, nothing more.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DownloadGateModal({ format, onConfirm, onCancel }) {
  // Lazy initialiser: read the stored profile once on mount, not every render.
  const [saved] = useState(getSavedProfile);
  const [name, setName] = useState(saved?.name ?? '');
  const [email, setEmail] = useState(saved?.email ?? '');
  const [organization, setOrganization] = useState(saved?.organization ?? '');
  const [purpose, setPurpose] = useState(saved?.purpose ?? PURPOSES[0]);
  const [touched, setTouched] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    function onKey(e) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const errors = {
    name: name.trim() ? null : 'Please enter your name.',
    email: EMAIL_RE.test(email.trim()) ? null : 'Please enter a valid email address.',
    organization: organization.trim() ? null : 'Please enter your organisation (or "Independent").',
  };
  const valid = !errors.name && !errors.email && !errors.organization;

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onConfirm({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      purpose,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-gate-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-full overflow-y-auto"
      >
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          <h2 id="download-gate-title" className="text-base font-semibold text-slate-800">
            Before you download
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            The data is free and always will be. We just ask who's using it so we can report
            usage to the people who fund this tool. You'll be asked once per session.
          </p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <Field
            label="Full name" value={name} onChange={setName} inputRef={firstFieldRef}
            error={touched && errors.name} autoComplete="name" placeholder="Jane Dias"
          />
          <Field
            label="Email" type="email" value={email} onChange={setEmail}
            error={touched && errors.email} autoComplete="email" placeholder="jane@university.edu"
          />
          <Field
            label="Organisation" value={organization} onChange={setOrganization}
            error={touched && errors.organization} autoComplete="organization"
            placeholder="National University of Timor-Leste"
          />

          <div>
            <label className="block text-xs text-slate-500 mb-1">What will you use it for?</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            >
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Your details are recorded for usage reporting only and are never sold or shared.
            Contact <a className="underline" href="mailto:xuantinhsea@gmail.com">xuantinhsea@gmail.com</a> to
            have your record removed.
          </p>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Download {format}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, error, inputRef, type = 'text', ...rest }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${
          error ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
        }`}
        {...rest}
      />
      {error && <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>}
    </div>
  );
}
