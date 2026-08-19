CREATE TABLE public.cochrane_referral_angles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  angle text NOT NULL,
  category text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cochrane_referral_angles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cochrane_referral_angles TO authenticated;
GRANT ALL ON public.cochrane_referral_angles TO service_role;
ALTER TABLE public.cochrane_referral_angles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cochrane referral angles" ON public.cochrane_referral_angles FOR SELECT USING (true);
CREATE POLICY "Admins manage cochrane referral angles" ON public.cochrane_referral_angles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_cochrane_referral_angles_updated_at BEFORE UPDATE ON public.cochrane_referral_angles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.cochrane_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name text NOT NULL,
  quote text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cochrane_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cochrane_reviews TO authenticated;
GRANT ALL ON public.cochrane_reviews TO service_role;
ALTER TABLE public.cochrane_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cochrane reviews" ON public.cochrane_reviews FOR SELECT USING (true);
CREATE POLICY "Admins manage cochrane reviews" ON public.cochrane_reviews FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_cochrane_reviews_updated_at BEFORE UPDATE ON public.cochrane_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.cochrane_reviews (reviewer_name, quote) VALUES
('Toby Rennick', 'Veepo turned my vision of a website into a reality! Parker was personable, insightful and all around easy to work with.'),
('Calem Wood', 'The website is smooth and sharp. All the essentials are met and more!'),
('Rick Bergh', 'Creative, efficient and affordable. You won''t be disappointed with this innovative company. They over delivered.'),
('Caden Steinke', 'VeePo did an awesome job creating my website.'),
('Aaron Garcia', 'Great experience working with VeePo. Professional, responsive, and the end result speaks for itself.'),
('Will Jacques', 'Parker was easy to deal with and delivered exactly what we asked for.');

INSERT INTO public.cochrane_referral_angles (angle, category) VALUES
('Somebody asks you every few months if you know a good website person. This is the answer you can hand them.', 'trusted-friend-ask'),
('You are not selling anything. You are just giving a name to somebody who already asked for one.', 'trusted-friend-ask'),
('The easiest introduction in the world is a first name and an email address. That is the whole ask.', 'trusted-friend-ask'),
('Most referrals never happen because nobody remembers to make them. Here is a reason to remember.', 'trusted-friend-ask'),
('A referral is you spending your reputation. Here is exactly why it is safe to spend it here.', 'proof-and-reputation'),
('Why a written proposal, no obligation, is the thing that makes a referral risk-free for your friend.', 'proof-and-reputation'),
('You can send someone our way and nothing happens to them unless they decide it should.', 'proof-and-reputation'),
('Ownership in writing is the reason people feel comfortable recommending us. Your domain, your content, your site.', 'proof-and-reputation'),
('What if they hate it. The honest answer to the fear that stops most people from recommending anybody.', 'reluctant-referrer'),
('Nobody wants to be the person who recommended the wrong contractor. Here is how we make sure you are not.', 'reluctant-referrer'),
('If your friend talks to us and decides against it, you have still done them a favour.', 'reluctant-referrer'),
('You do not have to vouch for the work. You just have to point.', 'reluctant-referrer'),
('Contractors recommend contractors. That is how work moves in this town, and always has.', 'trades-network'),
('The electrician who sends work to the plumber who sends work back. Websites belong in that loop.', 'trades-network'),
('If you are on a job site with four other trades, you are standing in the middle of a referral network.', 'trades-network'),
('The trades in Cochrane know who does good work long before Google does.', 'trades-network'),
('Three hundred dollars is not a finder''s fee. It is a thank you for spending your credibility.', 'why-we-pay'),
('We would rather pay the people who already know us than pay a platform to shout at strangers.', 'why-we-pay'),
('Advertising money has to go somewhere. We would rather it went to a neighbour.', 'why-we-pay'),
('Every dollar we do not spend on ads is a dollar we can hand to the person who made the introduction.', 'why-we-pay'),
('Three hundred dollars is a tank of diesel and a weekend. It is also one text message.', 'what-300-buys'),
('You get paid when they buy, not when they enquire. No chasing, no waiting on a maybe.', 'what-300-buys'),
('E-transfer, not credit, not a discount on future work. Money in your account.', 'what-300-buys'),
('The referral pays out on any build over twenty five hundred, which is most of them.', 'what-300-buys'),
('The realtor in your circle whose listing photos are better than her website.', 'who-to-think-of'),
('The salon owner who books everything through direct messages because her site never worked.', 'who-to-think-of'),
('The renovation company whose best work is buried on page four of a Facebook album.', 'who-to-think-of'),
('The coach or consultant who is brilliant in person and invisible online.', 'who-to-think-of'),
('The church or nonprofit whose service times are wrong on every page.', 'who-to-think-of'),
('The guy whose site still lists a phone number he stopped using two moves ago.', 'who-to-think-of'),
('The business whose site was built by a nephew who has since moved away.', 'who-to-think-of'),
('The shop that opened last spring and still has a landing page from a builder trial.', 'who-to-think-of'),
('Recommending anybody is awkward because it feels like selling. It stops feeling that way when the offer is honest.', 'awkward-recommendation'),
('You are allowed to say you get paid for the referral. Say it out loud. It makes it cleaner, not worse.', 'awkward-recommendation'),
('Tell your friend the truth: I get three hundred if you buy. Most people respect that more than a quiet introduction.', 'awkward-recommendation'),
('The referral that works is not a pitch. It is a sentence: talk to Parker, he built mine.', 'awkward-recommendation'),
('Spring is when the trades get busy and every bad website starts costing money. Good time to think of somebody.', 'seasonal'),
('January is when business owners finally look at their own site and wince. Send them a name.', 'seasonal'),
('Before stampede, before the rush, before the phone starts ringing. That is the window.', 'seasonal'),
('Winter is quiet enough to rebuild a website. Most owners never think of it until spring, when it is too late.', 'seasonal'),
('We built for Cochrane before it had this many neighbourhoods. The people who send us work are the reason.', 'proof-and-reputation'),
('Every client we have came from somebody vouching for us. This just puts a number on the thing that already happens.', 'why-we-pay');