import { Flag, UserPlus } from "lucide-react";
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
import { useActionCountries, useCreateConstructorAction } from "../../../hooks";

type ConstructorFormProps = {
  countries: ActionCountry[];
};

type ConstructorFormState = {
  constructor_ref: string;
  country_id: string;
  name: string;
  wikipedia_url: string;
};

const initialConstructorForm: ConstructorFormState = {
  constructor_ref: "",
  country_id: "",
  name: "",
  wikipedia_url: "",
};

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600";

export function ConstructorForm() {
  const { data, isLoading } = useActionCountries();
  const countries = data?.countries ?? [];
  const mutation = useCreateConstructorAction();
  const [form, setForm] = useState<ConstructorFormState>(
    initialConstructorForm,
  );
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
        constructor_ref: form.constructor_ref,
        country_id: Number(form.country_id),
        name: form.name,
        wikipedia_url: form.wikipedia_url,
      });
      setForm(initialConstructorForm);
      setStatus({
        tone: "success",
        message: "Escuderia cadastrada com sucesso.",
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
          maxLength={20}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, constructor_ref: value }))
          }
          required
          value={form.constructor_ref}
        />
      </FormField>
      <FormField label="Nome">
        <FormInput
          maxLength={25}
          onValueChange={(value) =>
            setForm((current) => ({ ...current, name: value }))
          }
          required
          value={form.name}
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
      <FormField label="URL da Wikipedia">
        <FormInput
          onValueChange={(value) =>
            setForm((current) => ({ ...current, wikipedia_url: value }))
          }
          required
          type="url"
          value={form.wikipedia_url}
        />
      </FormField>
      <StatusMessage status={status} />
      <button
        className={buttonClassName}
        disabled={mutation.isPending}
        type="submit"
      >
        <UserPlus className="h-4 w-4" />
        {mutation.isPending ? "Salvando..." : "Cadastrar escuderia"}
      </button>
    </form>
  );
}

function FormTitle() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
        <Flag className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-semibold">Cadastrar escuderia</h3>
    </div>
  );
}
