-- delete from userSessions where id not in (select id from users where email not like 'lane@rifeplayer.com');
delete from users where email not like 'lane@rifeplayer.com';