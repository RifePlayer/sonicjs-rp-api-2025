// node src/custom/db/migrate/migrate.js >  ./src/custom/db/migrate/import.sql
//   npx wrangler d1 execute sonicjs --file ./src/custom/db/migrate/import.sql

//   wrangler d1 execute sonicjs --local --file ./src/custom/import.sql
// npx wrangler d1 execute sonicjs --command="SELECT * FROM users limit 5"


import { readFileSync } from 'fs';
const programs = JSON.parse(readFileSync('./src/custom/db/migrate/rife-data.json'));

function migrate() {
  const testPrograms = programs.slice(0, 9999);

  console.log("delete from programs;");

  for (const program of testPrograms) {
    const id = uuidv4();
    const type = program.sweep ? "sweep" : "set";
    const slug = convertToSlug(program.title);
    const date = new Date().getTime();

    const sql = `insert into programs(id, type, title, slug, description, source, frequencies, sort, userId, createdOn, updatedOn)
 values ('${id}','${type}',"${program.title}","${slug}","${program.description}",'${program.source}','${program.frequencies}',100, "zc55f706d6s9655", "${date}","${date}");`;

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
function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace("_", "")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

migrate();
