import { Injectable } from "@nestjs/common";
import { EmailGateway } from "../domain/email-gateway";
import { EmailMessage } from "../domain/email-message";

@Injectable()
export class NotificationsService {
  constructor(private readonly emailGateway: EmailGateway) {}

  async send(message: EmailMessage) {
    return this.emailGateway.send(message);
  }
}
