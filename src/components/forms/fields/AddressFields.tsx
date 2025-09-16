import { useFormContext } from "react-hook-form";

type AddressErrors = {
  address?: {
    country?: { message?: string };
    city?: { message?: string };
    state?: { message?: string };
    street?: { message?: string };
    houseNumber?: { message?: string };
    zip?: { message?: string };
  };
};

export default function AddressFields() {
  const { register, formState } = useFormContext();
  const e = formState.errors as unknown as AddressErrors;

  const countryMsg = e.address?.country?.message;
  const cityMsg = e.address?.city?.message;
  const stateMsg = e.address?.state?.message;
  const streetMsg = e.address?.street?.message;
  const houseNumberMsg = e.address?.houseNumber?.message;
  const zipMsg = e.address?.zip?.message;

  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="u-label" htmlFor="country">
          מדינה *
        </label>
        <input
          id="country"
          className="u-input"
          autoComplete="country-name"
          {...register("address.country")}
          aria-invalid={countryMsg ? true : undefined}
          aria-describedby={countryMsg ? "signup-country-error" : undefined}
        />
        {countryMsg && (
          <p
            id="signup-country-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {countryMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="city">
          עיר *
        </label>
        <input
          id="city"
          className="u-input"
          autoComplete="address-level2"
          {...register("address.city")}
          aria-invalid={cityMsg ? true : undefined}
          aria-describedby={cityMsg ? "signup-city-error" : undefined}
        />
        {cityMsg && (
          <p
            id="signup-city-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {cityMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="state">
          מחוז/אזור
        </label>
        <input
          id="state"
          className="u-input"
          autoComplete="address-level1"
          {...register("address.state")}
          aria-invalid={stateMsg ? true : undefined}
          aria-describedby={stateMsg ? "signup-state-error" : undefined}
        />
        {stateMsg && (
          <p
            id="signup-state-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {stateMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="street">
          רחוב *
        </label>
        <input
          id="street"
          className="u-input"
          autoComplete="address-line1"
          {...register("address.street")}
          aria-invalid={streetMsg ? true : undefined}
          aria-describedby={streetMsg ? "signup-street-error" : undefined}
        />
        {streetMsg && (
          <p
            id="signup-street-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {streetMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="houseNumber">
          מספר בית *
        </label>
        <input
          id="houseNumber"
          type="number"
          className="u-input"
          autoComplete="address-line2"
          {...register("address.houseNumber", { valueAsNumber: true })}
        />
        {houseNumberMsg && (
          <p
            id="signup-houseNumber-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {houseNumberMsg}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="zip">
          מיקוד
        </label>
        <input
          id="zip"
          type="text"
          inputMode="numeric"
          pattern="^\d{2,}$"
          dir="ltr"
          className="u-input"
          autoComplete="postal-code"
          {...register("address.zip")}
        />

        {zipMsg && (
          <p
            id="signup-zip-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {zipMsg}
          </p>
        )}
      </div>
    </fieldset>
  );
}
