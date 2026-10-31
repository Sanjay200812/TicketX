-- Run against an isolated test database with database/booking.sql applied.
-- Entire test rolls back, including fixtures.
BEGIN;
INSERT INTO ticketx.show_seats(show_id,seat_id,price_paise) VALUES ('qa-lifecycle','A1',25000);
SELECT ticketx.reserve('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000001');
DO $$ BEGIN
 BEGIN
 PERFORM ticketx.reserve('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000002');
 RAISE EXCEPTION 'Competing customer obtained held seat' USING ERRCODE='XX000';
 EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL; END;
END $$;
UPDATE ticketx.show_seats SET hold_expires_at=now()-interval '1 second' WHERE show_id='qa-lifecycle';
SELECT ticketx.reserve('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000002');
DO $$ DECLARE first_booking ticketx.bookings; second_booking ticketx.bookings; BEGIN
 first_booking:=ticketx.confirm_demo('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003');
 second_booking:=ticketx.confirm_demo('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003');
 IF first_booking.id<>second_booking.id OR first_booking.total_paise<>25000 THEN RAISE EXCEPTION 'Idempotency or pricing failure'; END IF;
 BEGIN
 PERFORM ticketx.reserve('qa-lifecycle',ARRAY['A1'],'00000000-0000-0000-0000-000000000001');
 RAISE EXCEPTION 'Booked seat was reserved' USING ERRCODE='XX000';
 EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL; END;
END $$;
ROLLBACK;
