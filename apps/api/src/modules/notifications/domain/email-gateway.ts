import { EmailMessage } from "./email-message";

export abstract class EmailGateway {
  abstract send(message: EmailMessage): Promise<void>;
}
