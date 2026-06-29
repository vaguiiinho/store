import { Injectable } from "@nestjs/common";
import { EmailGateway } from "../../domain/email-gateway";
import { EmailMessage } from "../../domain/email-message";

@Injectable()
export class GmailEmailGateway extends EmailGateway {
  async send(_message: EmailMessage): Promise<void> {
    // MVP transport implementation will be wired later.
  }
}
