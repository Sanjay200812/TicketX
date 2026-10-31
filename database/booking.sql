-- TicketX transactional inventory. Apply using the deployment database owner.
CREATE SCHEMA IF NOT EXISTS ticketx;
CREATE TABLE IF NOT EXISTS ticketx.show_seats (
 show_id text NOT NULL,
 seat_id text NOT NULL,
 price_paise integer NOT NULL CHECK (price_paise >= 0),
 unavailable boolean NOT NULL DEFAULT false,
 hold_owner uuid,
 hold_expires_at timestamptz,
 booking_id uuid,
 PRIMARY KEY (show_id, seat_id),
 CHECK ((hold_owner IS NULL) = (hold_expires_at IS NULL)),
 CHECK (booking_id IS NULL OR hold_owner IS NULL)
);
CREATE TABLE IF NOT EXISTS ticketx.bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL,
 request_id uuid NOT NULL,
 show_id text NOT NULL,
 seats text[] NOT NULL,
 total_paise integer NOT NULL CHECK (total_paise >= 0),
 demo boolean NOT NULL DEFAULT true CHECK (demo),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (owner_id, request_id)
);
ALTER TABLE ticketx.show_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketx.bookings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA ticketx FROM PUBLIC;

CREATE OR REPLACE FUNCTION ticketx.reserve(p_show text, p_seats text[], p_owner uuid)
RETURNS timestamptz LANGUAGE plpgsql SECURITY INVOKER SET search_path = ticketx, pg_temp AS $$
DECLARE n integer; expiry timestamptz;
BEGIN
 IF p_seats IS NULL OR array_position(p_seats,NULL) IS NOT NULL OR p_owner IS NULL OR cardinality(p_seats) NOT BETWEEN 1 AND 10
 OR cardinality(p_seats) <> (SELECT count(DISTINCT x) FROM unnest(p_seats) x)
 THEN RAISE EXCEPTION 'Invalid seat selection'; END IF;
 -- Stable locking order prevents deadlocks between overlapping selections.
 PERFORM seat_id FROM show_seats WHERE show_id=p_show AND seat_id=ANY(p_seats) ORDER BY seat_id FOR UPDATE;
 SELECT count(*) INTO n FROM show_seats WHERE show_id=p_show AND seat_id=ANY(p_seats)
 AND NOT unavailable AND booking_id IS NULL
 AND (hold_owner IS NULL OR hold_expires_at <= clock_timestamp() OR hold_owner=p_owner);
 IF n <> cardinality(p_seats) THEN RAISE EXCEPTION 'Seats unavailable' USING ERRCODE='P0001'; END IF;
 expiry := clock_timestamp() + interval '10 minutes';
 UPDATE show_seats SET hold_owner=p_owner, hold_expires_at=expiry WHERE show_id=p_show AND seat_id=ANY(p_seats);
 RETURN expiry;
END $$;

CREATE OR REPLACE FUNCTION ticketx.confirm_demo(p_show text, p_seats text[], p_owner uuid, p_request uuid)
RETURNS ticketx.bookings LANGUAGE plpgsql SECURITY INVOKER SET search_path = ticketx, pg_temp AS $$
DECLARE result bookings; n integer; total integer;
BEGIN
 IF p_seats IS NULL OR array_position(p_seats,NULL) IS NOT NULL OR p_owner IS NULL OR p_request IS NULL OR cardinality(p_seats) NOT BETWEEN 1 AND 10
 OR cardinality(p_seats) <> (SELECT count(DISTINCT x) FROM unnest(p_seats) x)
 THEN RAISE EXCEPTION 'Invalid booking'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner::text || p_request::text,0));
 SELECT * INTO result FROM bookings WHERE owner_id=p_owner AND request_id=p_request;
 IF FOUND THEN
 IF result.show_id<>p_show OR NOT (result.seats @> p_seats AND result.seats <@ p_seats) THEN RAISE EXCEPTION 'Request already used'; END IF;
 RETURN result;
 END IF;
 PERFORM seat_id FROM show_seats WHERE show_id=p_show AND seat_id=ANY(p_seats) ORDER BY seat_id FOR UPDATE;
 SELECT count(*),sum(price_paise) INTO n,total FROM show_seats WHERE show_id=p_show AND seat_id=ANY(p_seats)
 AND NOT unavailable AND booking_id IS NULL AND hold_owner=p_owner AND hold_expires_at>clock_timestamp();
 IF n<>cardinality(p_seats) THEN RAISE EXCEPTION 'Hold expired or seats unavailable'; END IF;
 INSERT INTO bookings(owner_id,request_id,show_id,seats,total_paise) VALUES(p_owner,p_request,p_show,p_seats,total) RETURNING * INTO result;
 UPDATE show_seats SET booking_id=result.id,hold_owner=NULL,hold_expires_at=NULL WHERE show_id=p_show AND seat_id=ANY(p_seats);
 RETURN result;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ticketx FROM PUBLIC;

