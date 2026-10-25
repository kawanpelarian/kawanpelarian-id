-- CreateIndex
CREATE INDEX "events_isPublished_eventDate_idx" ON "events"("isPublished", "eventDate");

-- CreateIndex
CREATE INDEX "photos_albumId_idx" ON "photos"("albumId");

-- CreateIndex
CREATE INDEX "registrations_eventId_idx" ON "registrations"("eventId");
