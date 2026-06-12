import { UserPlus, Users } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../../../api";
import { FormField } from "../../../../../components/form-field";
import { FormInput } from "../../../../../components/form-input";
import { FormSelect } from "../../../../../components/form-select";
import {
  StatusMessage,
  type StatusMessageStatus,
} from "../../../../../components/status-message";
import type { ActionCountry } from "../../../../../types";
import { useActionCountries, useCreateDriverAction } from "../../../hooks";

type DriverFormProps = {
  countries: ActionCountry[];
};

type DriverFormState = {
  country_id: string;
  date_of_birth: string;
  driver_ref: string;
  family_name: string;
  given_name: string;
};

const initialDriverForm: DriverFormState = {
  country_id: "",
  date_of_birth: "",
  driver_ref: "",
  family_name: "",
  given_name: "",
};

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600";

export function DriverForm() {
  const { data, isLoading } = useActionCountries();
  const countries = data?.countries ?? [];
  const mutation = useCreateDriverAction();
  const [form, setForm] = useState<DriverFormState>(initialDriverForm);
  const [status, setStatus] = useState<StatusMessageStatus | null>(null);
  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        label: `${country.name} (${country.id})`,
        value: country.id,
      })),
    [countries],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      await mutation.mutateAsync({
        country_id: Number(form.country_id),
        date_of_birth: form.date_of_birth,
        driver_ref: form.driver_ref,
        family_name: form.family_name,
        given_name: form.given_name,
      });
      setForm(initialDriverForm);
      setStatus({
        tone: "success",
        message: "Piloto cadastrado com sucesso.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-gray-300 bg-gray-50 p-5"
      onSubmit={handleSubmit}
    >
      <FormTitle />
      <FormField label="Identificação">
        <FormInput
          maxLength={18}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, driver_ref: value }))
          }
          required
          value={form.driver_ref}
        />
      </FormField>
      <FormField label="Nome">
        <FormInput
          maxLength={17}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, given_name: value }))
          }
          required
          value={form.given_name}
        />
      </FormField>
      <FormField label="Nome da família">
        <FormInput
          maxLength={23}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, family_name: value }))
          }
          required
          value={form.family_name}
        />
      </FormField>
      <FormField label="Data de nascimento">
        <FormInput
          onValueChange={(value) =>
            setForm((current) => ({ ...current, date_of_birth: value }))
          }
          required
          type="date"
          value={form.date_of_birth}
        />
      </FormField>
      <FormField label="País">
        <FormSelect
          onValueChange={(value) =>
            setForm((current) => ({ ...current, country_id: value }))
          }
          options={countryOptions}
          placeholder="Selecione um país"
          required
          value={form.country_id}
          isLoading={isLoading}
        />
      </FormField>
      <StatusMessage status={status} />
      <button
        className={buttonClassName}
        disabled={mutation.isPending}
        type="submit"
      >
        <UserPlus className="h-4 w-4" />
        {mutation.isPending ? "Salvando..." : "Cadastrar piloto"}
      </button>
    </form>
  );
}

function FormTitle() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
        <Users className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-semibold">Cadastrar piloto</h3>
    </div>
  );
}
