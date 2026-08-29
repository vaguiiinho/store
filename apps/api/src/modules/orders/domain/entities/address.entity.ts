import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";

export type AddressProps = {
  id?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  reference?: string | null;
  customerId?: string | null;
};

export class Address {
  constructor(
    public readonly id: string,
    public cep: string,
    public street: string,
    public number: string,
    public complement: string | null,
    public district: string,
    public city: string,
    public state: string,
    public reference: string | null = null,
    public readonly customerId: string | null = null
  ) {}

  static create(props: AddressProps) {
    const cep = props.cep.replace(/\D/g, "");
    const state = props.state.trim().toUpperCase();

    if (cep.length !== 8) throw new DomainError("CEP deve conter 8 digitos.");
    if (!/^[A-Z]{2}$/.test(state)) throw new DomainError("Estado deve conter uma UF valida com 2 letras.");

    return new Address(
      EntityId.create(props.id, "ID do endereco").value,
      cep,
      RequiredText.create(props.street, "Logradouro").value,
      RequiredText.create(props.number, "Numero do endereco").value,
      props.complement?.trim() || null,
      RequiredText.create(props.district, "Bairro").value,
      RequiredText.create(props.city, "Cidade").value,
      state,
      props.reference?.trim() || null,
      props.customerId ? EntityId.create(props.customerId, "ID do cliente").value : null
    );
  }
}
