import { DomainError } from "../../../shared/domain/errors/domain-error";
import { EntityId } from "../../../shared/domain/value-objects/entity-id.value-object";
import { RequiredText } from "../../../shared/domain/value-objects/required-text.value-object";

export type CustomerProps = {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  document?: string | null;
};

export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string,
    public email: string | null = null,
    public document: string | null = null
  ) {}

  static create(props: CustomerProps) {
    const phone = props.phone.replace(/\D/g, "");
    const email = props.email?.trim().toLowerCase() || null;
    const document = props.document?.replace(/\D/g, "") || null;

    if (phone.length < 10 || phone.length > 11) throw new DomainError("Telefone deve conter 10 ou 11 digitos.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new DomainError("Email invalido.");
    if (document && document.length !== 11 && document.length !== 14) throw new DomainError("Documento deve conter 11 ou 14 digitos.");

    return new Customer(
      EntityId.create(props.id, "ID do cliente").value,
      RequiredText.create(props.name, "Nome do cliente").value,
      phone,
      email,
      document
    );
  }

  updateProfile(props: Omit<CustomerProps, "id">) {
    const validated = Customer.create({ ...props, id: this.id });
    this.name = validated.name;
    this.phone = validated.phone;
    this.email = validated.email;
    this.document = validated.document;
  }
}
