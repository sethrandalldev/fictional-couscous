BEGIN TRANSACTION;

INSERT into users (
  first_name, 
  last_name, 
  email, 
  password,
  joined) 
  values (
    'Seth', 
    'Randall', 
    'seth@gmail.com', 
    '$argon2i$v=19$m=4096,t=3,p=1$r8GQ6QkZ4BQ/h7EVh/CN4w$trzsvDTJN+RvdsgtrblLixDoJhV08qre45ln4z16GaA',
    '2022-01-01'
  );

COMMIT;