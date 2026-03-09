ALTER TABLE users
    ADD COLUMN IF NOT EXISTS notification_email_reminders BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_email_prescription BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_email_lab_results BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_email_marketing BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_sms_reminders BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_sms_urgent BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_push_all BOOLEAN,
    ADD COLUMN IF NOT EXISTS notification_reminder_timing VARCHAR(20);

UPDATE users
SET notification_email_reminders = COALESCE(notification_email_reminders, TRUE),
    notification_email_prescription = COALESCE(notification_email_prescription, TRUE),
    notification_email_lab_results = COALESCE(notification_email_lab_results, TRUE),
    notification_email_marketing = COALESCE(notification_email_marketing, FALSE),
    notification_sms_reminders = COALESCE(notification_sms_reminders, TRUE),
    notification_sms_urgent = COALESCE(notification_sms_urgent, TRUE),
    notification_push_all = COALESCE(notification_push_all, TRUE),
    notification_reminder_timing = COALESCE(notification_reminder_timing, '1_DAY');

ALTER TABLE users
    ALTER COLUMN notification_email_reminders SET DEFAULT TRUE,
    ALTER COLUMN notification_email_reminders SET NOT NULL,
    ALTER COLUMN notification_email_prescription SET DEFAULT TRUE,
    ALTER COLUMN notification_email_prescription SET NOT NULL,
    ALTER COLUMN notification_email_lab_results SET DEFAULT TRUE,
    ALTER COLUMN notification_email_lab_results SET NOT NULL,
    ALTER COLUMN notification_email_marketing SET DEFAULT FALSE,
    ALTER COLUMN notification_email_marketing SET NOT NULL,
    ALTER COLUMN notification_sms_reminders SET DEFAULT TRUE,
    ALTER COLUMN notification_sms_reminders SET NOT NULL,
    ALTER COLUMN notification_sms_urgent SET DEFAULT TRUE,
    ALTER COLUMN notification_sms_urgent SET NOT NULL,
    ALTER COLUMN notification_push_all SET DEFAULT TRUE,
    ALTER COLUMN notification_push_all SET NOT NULL,
    ALTER COLUMN notification_reminder_timing SET DEFAULT '1_DAY',
    ALTER COLUMN notification_reminder_timing SET NOT NULL;
