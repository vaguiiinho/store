import { Injectable } from "@nestjs/common";
import { EmailGateway } from "../../domain/email-gateway";
import { EmailMessage } from "../../domain/email-message";

@Injectable()
export class ResendEmailGateway extends EmailGateway {
  async send(_message: EmailMessage): Promise<void> {
    // Future provider recommended for transactional email.
  }
}
