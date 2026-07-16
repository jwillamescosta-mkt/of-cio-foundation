
create policy "Users manage own logo files - select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own logo files - insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own logo files - update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own logo files - delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own signature files - select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own signature files - insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own signature files - update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users manage own signature files - delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);
