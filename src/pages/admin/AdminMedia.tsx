import { PROJECTS } from "../../data";

const allImages = PROJECTS.flatMap((p) =>
  p.gallery.map((url, i) => ({ url, project: p.title, id: `${p.id}-${i}` }))
);

export default function AdminMedia() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1A1A18]">Libreria Media</h1>
          <p className="text-[#888580] text-sm mt-0.5">{allImages.length} file</p>
        </div>
        <div className="flex gap-3">
          <label className="bg-[#1B4332] text-white text-sm font-medium px-5 py-2.5 cursor-pointer hover:bg-[#143326] transition-colors">
            + Carica file
            <input type="file" multiple className="hidden" accept="image/*,video/*" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {allImages.map((img) => (
          <div key={img.id} className="group relative bg-[#EAE7E0] aspect-square overflow-hidden border border-[#DDD9D0] hover:border-[#1B4332] transition-colors cursor-pointer">
            <img
              src={img.url.replace("w=1200", "w=300").replace("h=800", "h=300")}
              alt={img.project}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
              <div className="p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-white text-xs font-medium truncate">{img.project}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Upload placeholder */}
        <label className="border-2 border-dashed border-[#DDD9D0] aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-[#1B4332] transition-colors bg-white">
          <span className="text-3xl text-[#DDD9D0] mb-2">+</span>
          <span className="text-xs text-[#888580]">Carica</span>
          <input type="file" multiple className="hidden" accept="image/*" />
        </label>
      </div>
    </div>
  );
}
