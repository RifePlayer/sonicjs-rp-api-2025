// node src/custom/db/migrate/migrate-user.js >  ./src/custom/db/migrate/user-data.sql
//   npx wrangler d1 execute sonicjs --file ./src/custom/db/migrate/user-data.sql

//   npx wrangler d1 execute sonicjs --local --file ./src/custom/db/migrate/user-data.sql
//   npx wrangler d1 execute sonicjs --local --file ./src/custom/db/migrate/user-truncate.sql


import { readFileSync } from 'fs';
const users = JSON.parse(readFileSync('./src/custom/db/migrate/user-data.json'));

function migrate() {
  const testUsers = users.slice(0, 9999);


  for (const user of testUsers) {
    const id = uuidv4();
    user.profile = {plan: user.plan};

    const sql = `insert into users(id, firstName, lastName, email, password, role, createdOn, updatedOn, profile)
    values ('${id}','${user.firstName}','${user.lastName}','test--${user.email}','${user.password}','${user.role}','${user.createdOn}','${user.updatedOn}','${JSON.stringify(user.profile)}');`;

    console.log(sql);
    ``;
    // console.log(freq.sweep)
  }
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

migrate();
