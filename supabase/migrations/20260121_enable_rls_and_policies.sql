ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_insert_self ON public.users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY users_update_self ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY categories_select_all ON public.categories FOR SELECT USING (true);

CREATE POLICY algorithms_select_published ON public.algorithms FOR SELECT USING (is_published);

CREATE POLICY progress_select_self ON public.progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY progress_insert_self ON public.progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY progress_update_self ON public.progress FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY submissions_select_self ON public.submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY submissions_insert_self ON public.submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY submissions_update_self ON public.submissions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY competitions_select_public ON public.competitions FOR SELECT USING (is_public);

CREATE POLICY competition_participants_select_self ON public.competition_participants FOR SELECT USING (user_id = auth.uid());
CREATE POLICY competition_participants_insert_self ON public.competition_participants FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY competition_participants_update_self ON public.competition_participants FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());