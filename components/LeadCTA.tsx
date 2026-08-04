'use client';

import { useEffect, useState } from 'react';
import { company } from '@/lib/company';

type Variant = 'primary' | 'secondary' | 'full' | 'ghost';

/**
 * Кнопка-заявка с модальной формой (Том 3, п. 3.4): три поля — имя, телефон,
 * комментарий по параметрам. Форма в модалке без ухода со страницы.
 * Защита от спам-ботов — honeypot-поле, без капчи (Том 8, п. 8.5).
 */
export default function LeadCTA({
  label = 'Узнать цену и сроки',
  variant = 'primary',
  source = 'site',
  sku,
  defaultComment = '',
  title = 'Оставьте заявку',
}: {
  label?: string;
  variant?: Variant;
  source?: string;
  sku?: string;
  defaultComment?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('company_website')) return; // honeypot заполнен ботом
    setStatus('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          comment: data.get('comment'),
          source,
          sku,
        }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const cls =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'ghost'
        ? 'btn-ghost'
        : variant === 'full'
          ? 'btn-primary w-full'
          : 'btn-primary';

  return (
    <>
      <button type="button" className={cls} onClick={() => { setOpen(true); setStatus('idle'); }}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-ink-600 bg-ink-900 p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {status === 'ok' ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-2xl">✓</div>
                <h3 className="text-lg">Заявка принята</h3>
                <p className="mt-2 text-sm text-steel-400">
                  Свяжемся с вами в ближайшее время. Или напишите нам в WhatsApp прямо сейчас.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <a href={waLink(defaultComment)} className="btn-secondary w-full" target="_blank" rel="noopener">
                    Написать в WhatsApp
                  </a>
                  <button className="btn-ghost" onClick={() => setOpen(false)}>Закрыть</button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="text-lg">{title}</h3>
                  <button onClick={() => setOpen(false)} className="text-steel-400 hover:text-white" aria-label="Закрыть">✕</button>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                  <input
                    name="name"
                    required
                    placeholder="Ваше имя"
                    className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-steel-100 placeholder:text-steel-500 focus:border-steel-400 focus:outline-none"
                  />
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="Телефон / WhatsApp"
                    className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-steel-100 placeholder:text-steel-500 focus:border-steel-400 focus:outline-none"
                  />
                  <textarea
                    name="comment"
                    rows={3}
                    defaultValue={defaultComment}
                    placeholder="Комментарий по параметрам (необязательно)"
                    className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-steel-100 placeholder:text-steel-500 focus:border-steel-400 focus:outline-none"
                  />
                  {/* honeypot — скрыт от людей, ловит ботов */}
                  <input name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  {status === 'error' && (
                    <p className="text-sm text-accent-400">Не удалось отправить. Проверьте телефон или напишите в WhatsApp.</p>
                  )}
                  <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
                  </button>
                  <p className="text-center text-xs text-steel-500">
                    Нажимая кнопку, вы соглашаетесь на обработку контактных данных.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function waLink(text: string): string {
  const phone = company.whatsapp.replace(/\D/g, '');
  const msg = encodeURIComponent(text || 'Здравствуйте! Пишу с сайта Profik.kz.');
  return `https://wa.me/${phone}?text=${msg}`;
}
