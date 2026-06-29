import { Module } from "@nestjs/common";
import { EmailGateway } from "./domain/email-gateway";
import { NotificationsService } from "./application/notifications.service";
import { GmailEmailGateway } from "./infrastructure/gateways/gmail-email.gateway";

@Module({
  providers: [
    NotificationsService,
    {
      provide: EmailGateway,
      useClass: GmailEmailGateway
    }
  ],
  exports: [NotificationsService]
})
export class NotificationsModule {}
