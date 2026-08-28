import { Link, useLocation } from "react-router-dom";

const sectors = ["Barbieri & Parrucchieri", "Uffici", "Negozi", "Scuole"];
const sectorIds = ["barbieri", "uffici", "negozi", "scuole"];

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#1A1A18] text-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-5 h-5 bg-[#B5965A] rounded-sm" />
            <span className="font-display text-lg font-medium">
              Artigiana<span className="text-[#B5965A]">Legno</span>
            </span>
          </div>
          <p className="text-sm text-[#888580] leading-relaxed mb-6">
            Arredi su misura per barbieri, uffici, negozi e scuole.<br />
            Dall'idea al prodotto finito, ogni pezzo è unico.
          </p>
          <div className="flex gap-4">
            {["IG", "FB", "LI"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-8 h-8 border border-[#333330] flex items-center justify-center text-xs text-[#888580] hover:border-[#B5965A] hover:text-[#B5965A] transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888580] mb-5">Settori</h4>
          <ul className="space-y-3">
            {sectors.map((s, i) => (
              <li key={s}>
                <Link
                  to={`/settori/${sectorIds[i]}`}
                  className="text-sm text-[#DDD9D0] hover:text-[#B5965A] transition-colors"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888580] mb-5">Azienda</h4>
          <ul className="space-y-3">
            {[
              ["Chi siamo", "/chi-siamo"],
              ["Progetti", "/progetti"],
              ["Preventivo", "/preventivo"],
              ["Contatti", "/contatti"],
              ["Area Admin", "/admin"],
            ].map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#DDD9D0] hover:text-[#B5965A] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888580] mb-5">Contatti</h4>
          <ul className="space-y-3 text-sm text-[#DDD9D0]">
            <li>Via dell'Artigiano, 14<br />40128 Bologna (BO)</li>
            <li>
              <a href="tel:+390512345678" className="hover:text-[#B5965A] transition-colors">
                +39 051 234 5678
              </a>
            </li>
            <li>
              <a href="mailto:info@artigianalegno.it" className="hover:text-[#B5965A] transition-colors">
                info@artigianalegno.it
              </a>
            </li>
            <li className="text-[#888580]">Lun–Ven 8:30–18:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#2A2A28] max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#555552]">
        <span>© 2025 ArtigianaLegno Srl – P.IVA 02345678901</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#888580] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#888580] transition-colors">Cookie Policy</a>
          <a href="#" className="hover:text-[#888580] transition-colors">Note legali</a>
        </div>
      </div>
    </footer>
  );
}
