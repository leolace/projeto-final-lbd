import { Flag, UserPlus, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../api";
import { useAuth } from "../../auth";
import type { ActionCountry } from "../../types";
import { UserType } from "../../types";
import {
  useActionCountries,
  useCreateConstructorAction,
  useCreateDriverAction
} from "./hooks";

type FormStatus = {
  tone: "success" | "error";
  message: string;
};

type ConstructorFormState = {
  constructor_ref: string;
  name: string;
  country_id: string;
  wikipedia_url: string;
};

type DriverFormState = {
  driver_ref: string;
  given_name: string;
  family_name: string;
  date_of_birth: string;
  country_id: string;
};

const initialConstructorForm: ConstructorFormState = {
  constructor_ref: "",
  name: "",
  country_id: "",
  wikipedia_url: ""
};

const initialDriverForm: DriverFormState = {
  driver_ref: "",
  given_name: "",
  family_name: "",
  date_of_birth: "",
  country_id: ""
};

const inputClassName =
  "h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-black";

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600";

export function ActionsPage() {
  const { user } = useAuth();

  if (user?.tipo !== UserType.Admin) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          Nenhuma ação disponível para este perfil.
        </div>
      </section>
    );
  }

  return <AdminActions />;
}

function AdminActions() {
  const countries = useActionCountries();

  return (
    <section className="space-y-8">
      <PageHeader />

      {countries.isLoading ? (
        <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          Carregando países...
        </div>
      ) : null}

      {countries.error ? (
        <StatusMessage
          status={{
            tone: "error",
            message: getApiErrorMessage(countries.error)
          }}
        />
      ) : null}

      {!countries.isLoading && !countries.error ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <ConstructorForm countries={countries.data?.countries ?? []} />
          <DriverForm countries={countries.data?.countries ?? []} />
        </div>
      ) : null}
    </section>
  );
}

function PageHeader() {
  return (
    <div className="border-b border-gray-200 pb-6">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
        Ações
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Cadastros</h2>
    </div>
  );
}

function ConstructorForm({ countries }: { countries: ActionCountry[] }) {
  const mutation = useCreateConstructorAction();
  const [form, setForm] = useState<ConstructorFormState>(initialConstructorForm);
  const [status, setStatus] = useState<FormStatus | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      await mutation.mutateAsync({
        constructor_ref: form.constructor_ref,
        name: form.name,
        country_id: Number(form.country_id),
        wikipedia_url: form.wikipedia_url
      });
      setForm(initialConstructorForm);
      setStatus({
        tone: "success",
        message: "Escuderia cadastrada com sucesso."
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: getApiErrorMessage(error)
      });
    }
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-gray-300 bg-gray-50 p-5"
      onSubmit={handleSubmit}
    >
      <FormTitle icon={Flag} title="Cadastrar escuderia" />
      <InputField
        label="constructor_ref"
        maxLength={20}
        onChange={(value) => setForm((current) => ({ ...current, constructor_ref: value }))}
        required
        value={form.constructor_ref}
      />
      <InputField
        label="name"
        maxLength={25}
        onChange={(value) => setForm((current) => ({ ...current, name: value }))}
        required
        value={form.name}
      />
      <CountrySelect
        countries={countries}
        onChange={(value) => setForm((current) => ({ ...current, country_id: value }))}
        value={form.country_id}
      />
      <InputField
        label="wikipedia_url"
        onChange={(value) => setForm((current) => ({ ...current, wikipedia_url: value }))}
        required
        type="url"
        value={form.wikipedia_url}
      />
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

function DriverForm({ countries }: { countries: ActionCountry[] }) {
  const mutation = useCreateDriverAction();
  const [form, setForm] = useState<DriverFormState>(initialDriverForm);
  const [status, setStatus] = useState<FormStatus | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      await mutation.mutateAsync({
        driver_ref: form.driver_ref,
        given_name: form.given_name,
        family_name: form.family_name,
        date_of_birth: form.date_of_birth,
        country_id: Number(form.country_id)
      });
      setForm(initialDriverForm);
      setStatus({
        tone: "success",
        message: "Piloto cadastrado com sucesso."
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: getApiErrorMessage(error)
      });
    }
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-gray-300 bg-gray-50 p-5"
      onSubmit={handleSubmit}
    >
      <FormTitle icon={Users} title="Cadastrar piloto" />
      <InputField
        label="driver_ref"
        maxLength={18}
        onChange={(value) => setForm((current) => ({ ...current, driver_ref: value }))}
        required
        value={form.driver_ref}
      />
      <InputField
        label="given_name"
        maxLength={17}
        onChange={(value) => setForm((current) => ({ ...current, given_name: value }))}
        required
        value={form.given_name}
      />
      <InputField
        label="family_name"
        maxLength={23}
        onChange={(value) => setForm((current) => ({ ...current, family_name: value }))}
        required
        value={form.family_name}
      />
      <InputField
        label="date_of_birth"
        onChange={(value) => setForm((current) => ({ ...current, date_of_birth: value }))}
        required
        type="date"
        value={form.date_of_birth}
      />
      <CountrySelect
        countries={countries}
        onChange={(value) => setForm((current) => ({ ...current, country_id: value }))}
        value={form.country_id}
      />
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

function FormTitle({
  icon: Icon,
  title
}: {
  icon: typeof Flag;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
  );
}

function InputField({
  label,
  maxLength,
  onChange,
  required,
  type = "text",
  value
}: {
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "date" | "text" | "url";
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        className={inputClassName}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function CountrySelect({
  countries,
  onChange,
  value
}: {
  countries: ActionCountry[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">country_id</span>
      <select
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      >
        <option value="">Selecione um país</option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name} ({country.id})
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusMessage({ status }: { status: FormStatus | null }) {
  if (!status) {
    return null;
  }

  const toneClassName =
    status.tone === "success"
      ? "border-green-700 bg-green-50 text-green-900"
      : "border-red-700 bg-red-50 text-red-900";

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${toneClassName}`}>
      {status.message}
    </div>
  );
}
