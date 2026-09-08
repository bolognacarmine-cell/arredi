import { legalConfig } from "../../siteConfig"

export default function LegalInfoCard() {
  const { company } = legalConfig

  return (
    <div className="rounded-lg border border-[#DDD9D0] bg-white p-6">
      <h3 className="font-display text-lg font-medium text-[#1A1A18] mb-4">
        Titolare del trattamento
      </h3>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-[#4A4A46]">Nome azienda</dt>
          <dd className="text-[#1A1A18]">{company.name}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#4A4A46]">Indirizzo</dt>
          <dd className="text-[#1A1A18]">{company.address}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#4A4A46]">Email</dt>
          <dd>
            <a
              href={`mailto:${company.email}`}
              className="text-[#1B4332] transition-colors hover:underline"
            >
              {company.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#4A4A46]">Telefono</dt>
          <dd>
            <a
              href={`tel:${company.phone}`}
              className="text-[#1B4332] transition-colors hover:underline"
            >
              {company.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#4A4A46]">WhatsApp</dt>
          <dd>
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B4332] transition-colors hover:underline"
            >
              {company.whatsapp}
            </a>
          </dd>
        </div>
        {company.vat && (
          <div>
            <dt className="font-semibold text-[#4A4A46]">P.IVA</dt>
            <dd className="text-[#1A1A18]">{company.vat}</dd>
          </div>
        )}
        {company.pec && (
          <div>
            <dt className="font-semibold text-[#4A4A46]">PEC</dt>
            <dd>
              <a
                href={`mailto:${company.pec}`}
                className="text-[#1B4332] transition-colors hover:underline"
              >
                {company.pec}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}