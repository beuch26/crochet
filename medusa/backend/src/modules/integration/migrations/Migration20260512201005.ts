import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260512201005 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "integration" drop constraint if exists "integration_slug_unique";`);
    this.addSql(`create table if not exists "integration" ("id" text not null, "slug" text not null, "name" text not null, "category" text not null, "description" text null, "logo_path" text null, "enabled" boolean not null default false, "config_public" jsonb not null default '{}', "config_encrypted" text null, "health_status" text check ("health_status" in ('ok', 'error', 'unknown')) not null default 'unknown', "health_message" text null, "last_health_check_at" timestamptz null, "last_used_at" timestamptz null, "connected_at" timestamptz null, "rotated_at" timestamptz null, "expires_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "integration_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_integration_slug_unique" ON "integration" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_integration_deleted_at" ON "integration" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "integration_audit_log" ("id" text not null, "integration_id" text not null, "actor_id" text null, "action" text check ("action" in ('created', 'updated', 'rotated', 'tested', 'enabled', 'disabled', 'deleted')) not null, "changed_fields" text[] not null default '{}', "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "integration_audit_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_integration_audit_log_deleted_at" ON "integration_audit_log" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "integration" cascade;`);

    this.addSql(`drop table if exists "integration_audit_log" cascade;`);
  }

}
