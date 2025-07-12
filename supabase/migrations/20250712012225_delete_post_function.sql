create function public.delete_post(post_id bigint)
returns void as $$
begin
  delete from public.posts
  where id = post_id;
end;
$$ language plpgsql;