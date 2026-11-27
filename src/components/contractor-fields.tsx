import { categories, contractorStatuses } from "@/lib/categories";

export function ContractorFields({
  values,
  showStatus,
  showCap,
  passwordHint,
}: {
  values?: {
    businessName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    categories?: string[];
    serviceZips?: string[];
    city?: string | null;
    state?: string | null;
    bio?: string | null;
    licenseNumber?: string | null;
    yearsInBusiness?: number | null;
    monthlyLeadCap?: number | null;
    webhookUrl?: string | null;
    status?: string;
  };
  showStatus: boolean;
  showCap: boolean;
  passwordHint: string;
}) {
  const inputClass = "mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base";
  return (
    <div className="grid gap-4">
      <label className="block text-sm font-semibold">
        Business name
        <input name="businessName" required defaultValue={values?.businessName ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Contact name
        <input name="contactName" required defaultValue={values?.contactName ?? ""} className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required defaultValue={values?.email ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <input name="phone" type="tel" required defaultValue={values?.phone ?? ""} className={inputClass} />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Categories</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 rounded-2xl border border-line px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="categories"
                value={category.id}
                defaultChecked={values?.categories?.includes(category.id) ?? false}
                className="accent-forest"
              />
              {category.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold">
        Service ZIP codes
        <textarea
          name="serviceZips"
          required
          rows={3}
          defaultValue={values?.serviceZips?.join("\n") ?? ""}
          placeholder="78704&#10;78745"
          className={inputClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          City
          <input name="city" defaultValue={values?.city ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          State
          <input name="state" maxLength={2} defaultValue={values?.state ?? ""} placeholder="TX" className={inputClass} />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        License number
        <input name="licenseNumber" defaultValue={values?.licenseNumber ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Years in business
        <input name="yearsInBusiness" inputMode="numeric" defaultValue={values?.yearsInBusiness ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Short bio
        <textarea name="bio" rows={3} defaultValue={values?.bio ?? ""} className={inputClass} />
      </label>
      {showCap ? (
        <label className="block text-sm font-semibold">
          Monthly lead cap
          <input
            name="monthlyLeadCap"
            inputMode="numeric"
            defaultValue={values?.monthlyLeadCap ?? ""}
            placeholder="Blank means no cap"
            className={inputClass}
          />
        </label>
      ) : null}
      {showStatus ? (
        <label className="block text-sm font-semibold">
          Status
          <select name="status" defaultValue={values?.status ?? "PENDING"} className={inputClass}>
            {contractorStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="status" value={values?.status ?? "PENDING"} />
      )}
      <label className="block text-sm font-semibold">
        Webhook URL
        <input name="webhookUrl" defaultValue={values?.webhookUrl ?? ""} placeholder="https://" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Webhook secret
        <input name="webhookSecret" placeholder="Leave blank to keep the current secret" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input name="password" type="password" autoComplete="new-password" className={inputClass} />
        <span className="mt-1 block font-normal text-ink-soft">{passwordHint}</span>
      </label>
    </div>
  );
}
