import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const migration = new URL('../prisma/migrations/20261122000300_initial/migration.sql',import.meta.url);

test('Prisma migration creates the ten requested models and enforces administration and media constraints',async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile(migration,'utf8'));
    const {rows} = await db.query("select tablename from pg_tables where schemaname='public'");
    const tables = new Set(rows.map(row => row.tablename));
    for (const table of ['users','user_roles','businesses','products','product_categories','product_images',
      'inquiries','site_settings','social_links','activity_logs','media_assets','inquiry_rate_limits']) {
      assert.ok(tables.has(table),table);
    }

    const user = (await db.query("insert into users(clerk_id,updated_at) values ('user_LocalFixture',now()) returning id")).rows[0];
    assert.equal((await db.query('select count(*)::int as count from user_roles where user_id=$1',[user.id])).rows[0].count,0);
    await assert.rejects(db.query("insert into users(clerk_id,updated_at) values ('user_LocalFixture',now())"),{code:'23505'});
    await db.query("insert into user_roles(user_id,role,updated_at) values ($1,'admin',now())",[user.id]);
    await assert.rejects(db.query("insert into user_roles(user_id,role,updated_at) values ($1,'admin',now())",[user.id]),{code:'23505'});
    await db.query("insert into activity_logs(actor_id,action,resource) values ($1,'publish','products')",[user.id]);
    await db.query('delete from users where id=$1',[user.id]);
    assert.equal((await db.query('select actor_id from activity_logs')).rows[0].actor_id,null);
    assert.equal((await db.query('select count(*)::int as count from user_roles')).rows[0].count,0);

    const listing = 'https://www.amazon.com/dp/TEST000001';
    const category = (await db.query("insert into product_categories(name,slug,updated_at) values ('Fixture','fixture',now()) returning id")).rows[0];
    const product = (await db.query(
      "insert into products(name,slug,short_description,description,amazon_url,category_id,updated_at) values ('Fixture','fixture','Short','Full',$1,$2,now()) returning id",
      [listing,category.id],
    )).rows[0];
    await assert.rejects(db.query('update products set published=true where id=$1',[product.id]),{code:'23514'});
    await assert.rejects(db.query('update products set amazon_url=$1 where id=$2',['https://example.test/item',product.id]),{code:'23514'});
    const restrictViolation = error => ['23001','23503'].includes(error.code);
    await assert.rejects(db.query('delete from product_categories where id=$1',[category.id]),restrictViolation);
    const path = '/media/fixture.webp';
    await db.query('insert into media_assets(url,updated_at) values ($1,now())',[path]);
    await db.query("update products set image=$1,image_alt='Fixture image',published=true where id=$2",[path,product.id]);
    await db.query("insert into product_images(product_id,path,alt,updated_at) values ($1,$2,'Gallery image',now())",[product.id,path]);
    await assert.rejects(db.query('delete from media_assets where url=$1',[path]),restrictViolation);
    await db.query('delete from products where id=$1',[product.id]);
    assert.equal((await db.query('select count(*)::int as count from product_images')).rows[0].count,0);
    assert.equal((await db.query('select count(*)::int as count from media_assets where url=$1',[path])).rows[0].count,1);

    await db.query("insert into inquiries(name,email,kind,message,updated_at) values ('Fixture User','fixture@example.test','anamcart','Valid local fixture message.',now())");
    assert.equal((await db.query('select status,kind from inquiries')).rows[0].kind,'anamcart');
    assert.equal((await db.query('select status from inquiries')).rows[0].status,'new');
  } finally { await db.close(); }
});
