/**
 * Classi condivise dei componenti del form articoli.
 *
 * Riusano letteralmente lo stile del pannello admin esistente
 * (AdminProjects/AdminSettings): campi con bordo #DDD9D0, sfondo #F7F5F0,
 * focus verde #1B4332, etichette uppercase 12px.
 */

export const labelCls = "mb-1 block text-xs uppercase tracking-wide text-[#888580]"

export const inputCls =
  "w-full border border-[#DDD9D0] bg-[#F7F5F0] px-3 py-3 text-sm text-[#1A1A18] focus:border-[#1B4332] focus:outline-none min-h-[44px]"

export const textareaCls = `${inputCls} resize-y`

export const selectCls = inputCls

export const errorTextCls = "mt-1 block text-xs text-red-600"
export const warningTextCls = "mt-1 block text-xs text-amber-600"

export const sectionCls = "mb-8 border border-[#DDD9D0] bg-white p-5 sm:p-6"

export const sectionTitleCls =
  "mb-4 font-display text-base font-bold text-[#1A1A18] flex items-center gap-2"

export const btnPrimaryCls =
  "bg-[#1B4332] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]"

export const btnSecondaryCls =
  "border border-[#DDD9D0] px-5 py-3 text-sm text-[#4A4A46] transition-colors hover:bg-[#EAE7E0] disabled:opacity-50 min-h-[44px]"

export const btnDangerCls =
  "border border-red-200 px-5 py-3 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 min-h-[44px]"

export const chipCls =
  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[32px]"

export const hintCls = "mt-1 block text-xs text-[#888580]"

/** Contatore caratteri con colorazione in base al limite. */
export function counterClass(length: number, max: number): string {
  if (length > max) return "text-xs text-red-600 font-medium"
  if (length > max * 0.9) return "text-xs text-amber-600 font-medium"
  return "text-xs text-[#888580]"
}
