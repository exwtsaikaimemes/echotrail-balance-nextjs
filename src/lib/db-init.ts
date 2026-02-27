import pool from "./db";
import { getDefaultWeights, getDefaultAllowances, getDefaultAttributeDefs } from "@/constants/balance-defaults";

// ── Table Schemas ──

const CREATE_BUDGET_FORMULAS_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_budget_formulas (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(64) NOT NULL UNIQUE,
    expression  VARCHAR(255) NOT NULL,
    description TEXT,
    created_by  VARCHAR(32),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_users (
    id          VARCHAR(36) PRIMARY KEY,
    username    VARCHAR(32) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(16) NOT NULL DEFAULT 'user',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_items (
    id                  VARCHAR(36) PRIMARY KEY,
    item_key            VARCHAR(255) NOT NULL UNIQUE,
    object_name         VARCHAR(255) NOT NULL,
    custom_name         VARCHAR(255) NOT NULL,
    equipment           VARCHAR(64) NOT NULL,
    rarity              VARCHAR(32) NOT NULL,
    uses_base_stats     TINYINT NOT NULL DEFAULT 1,
    secret_item         TINYINT NOT NULL DEFAULT 0,
    can_drop            TINYINT NOT NULL DEFAULT 1,
    is_off_hand         TINYINT NOT NULL DEFAULT 0,
    is_both_hands       TINYINT NOT NULL DEFAULT 0,
    is_test             TINYINT NOT NULL DEFAULT 0,
    custom_model_data   VARCHAR(255),
    equippable_asset_id VARCHAR(255),
    enchantments        JSON NOT NULL,
    attributes          JSON NOT NULL,
    source              VARCHAR(32) NOT NULL DEFAULT 'manual',
    created_by          VARCHAR(32),
    modified_by         VARCHAR(32),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_HISTORY_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_item_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    item_id         VARCHAR(36) NOT NULL,
    item_key        VARCHAR(255) NOT NULL,
    item_name       VARCHAR(255) NOT NULL,
    change_type     ENUM('created','updated','deleted') NOT NULL,
    changed_by      VARCHAR(32) NOT NULL,
    budget_before   DECIMAL(10,2) DEFAULT NULL,
    budget_after    DECIMAL(10,2) DEFAULT NULL,
    snapshot_before JSON DEFAULT NULL,
    snapshot_after  JSON DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_item_id (item_id),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_COMMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_item_comments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id     VARCHAR(36) NOT NULL,
    username    VARCHAR(32) NOT NULL,
    comment     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_item_id (item_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_PATCH_VERSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_patch_versions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    version     VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    is_current  TINYINT NOT NULL DEFAULT 0,
    created_by  VARCHAR(32),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const CREATE_BALANCE_CONFIG_TABLE = `
  CREATE TABLE IF NOT EXISTS echotrail_itemmanager_balance_config (
    id          INT PRIMARY KEY,
    formula     VARCHAR(64) NOT NULL DEFAULT 'weight_x_max',
    weights     JSON NOT NULL,
    allowances  JSON NOT NULL,
    attr_defs   JSON NOT NULL,
    modified_by VARCHAR(32),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

// ── Merge new default weights and attribute definitions into existing balance config ──

async function mergeNewDefaults(): Promise<void> {
  const [rows] = await pool.execute(
    "SELECT weights, attr_defs FROM echotrail_itemmanager_balance_config WHERE id = 1"
  );
  const typedRows = rows as Array<{ weights: string | Record<string, number>; attr_defs: string | Record<string, unknown> }>;
  if (typedRows.length === 0) return;

  const row = typedRows[0];
  const storedWeights: Record<string, number> =
    typeof row.weights === "string" ? JSON.parse(row.weights) : row.weights;
  const storedDefs: Record<string, unknown> =
    typeof row.attr_defs === "string" ? JSON.parse(row.attr_defs) : row.attr_defs;

  const defaultWeights = getDefaultWeights();
  const defaultDefs = getDefaultAttributeDefs();

  let changed = false;

  for (const [key, val] of Object.entries(defaultWeights)) {
    if (storedWeights[key] === undefined) {
      storedWeights[key] = val;
      changed = true;
    }
  }

  for (const [key, val] of Object.entries(defaultDefs)) {
    if (!storedDefs[key]) {
      storedDefs[key] = val;
      changed = true;
    }
  }

  if (changed) {
    await pool.execute(
      "UPDATE echotrail_itemmanager_balance_config SET weights = ?, attr_defs = ? WHERE id = 1",
      [JSON.stringify(storedWeights), JSON.stringify(storedDefs)]
    );
  }
}

// ── Initialize database: create tables, run migrations, seed balance config, merge defaults ──

export async function initializeDatabase(): Promise<void> {
  // 1. Create all tables
  await pool.execute(CREATE_USERS_TABLE);
  await pool.execute(CREATE_ITEMS_TABLE);
  await pool.execute(CREATE_HISTORY_TABLE);
  await pool.execute(CREATE_COMMENTS_TABLE);
  await pool.execute(CREATE_BALANCE_CONFIG_TABLE);
  await pool.execute(CREATE_BUDGET_FORMULAS_TABLE);
  await pool.execute(CREATE_PATCH_VERSIONS_TABLE);

  // 2. Migration: add is_test column if missing
  const [isTestCols] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'echotrail_itemmanager_items'
       AND COLUMN_NAME = 'is_test'`
  );
  if ((isTestCols as unknown[]).length === 0) {
    await pool.execute(
      "ALTER TABLE echotrail_itemmanager_items ADD COLUMN is_test TINYINT NOT NULL DEFAULT 0 AFTER is_both_hands"
    );
  }

  // 3. Migration: add role column to users if missing, set tsais as admin
  const [roleCols] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'echotrail_itemmanager_users'
       AND COLUMN_NAME = 'role'`
  );
  if ((roleCols as unknown[]).length === 0) {
    await pool.execute(
      "ALTER TABLE echotrail_itemmanager_users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'user' AFTER password"
    );
    await pool.execute(
      "UPDATE echotrail_itemmanager_users SET role = 'admin' WHERE username = 'tsais'"
    );
  }

  // 4. Seed balance config if empty
  const [configRows] = await pool.execute(
    "SELECT id FROM echotrail_itemmanager_balance_config WHERE id = 1"
  );
  if ((configRows as unknown[]).length === 0) {
    await pool.execute(
      "INSERT INTO echotrail_itemmanager_balance_config (id, formula, weights, allowances, attr_defs) VALUES (1, ?, ?, ?, ?)",
      [
        "weight_x_max",
        JSON.stringify(getDefaultWeights()),
        JSON.stringify(getDefaultAllowances()),
        JSON.stringify(getDefaultAttributeDefs()),
      ]
    );
  }

  // 5. Merge any new default weights/attr_defs into existing config
  await mergeNewDefaults();

  // 6. Seed default budget formula if formulas table is empty
  const [formulaRows] = await pool.execute(
    "SELECT id FROM echotrail_itemmanager_budget_formulas LIMIT 1"
  );
  if ((formulaRows as unknown[]).length === 0) {
    const { v4: uuidv4 } = await import("uuid");
    await pool.execute(
      "INSERT INTO echotrail_itemmanager_budget_formulas (id, name, expression, description, created_by) VALUES (?, ?, ?, ?, ?)",
      [
        uuidv4(),
        "Flat",
        "weight * max",
        "Simple linear cost",
        "system",
      ]
    );
  }

  // 7. Migration: add patch_version column to history table if missing
  const [patchVersionCols] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'echotrail_itemmanager_item_history'
       AND COLUMN_NAME = 'patch_version'`
  );
  if ((patchVersionCols as unknown[]).length === 0) {
    await pool.execute(
      "ALTER TABLE echotrail_itemmanager_item_history ADD COLUMN patch_version VARCHAR(32) DEFAULT NULL AFTER snapshot_after"
    );
    await pool.execute(
      "UPDATE echotrail_itemmanager_item_history SET patch_version = 'Pre-3.0.0' WHERE patch_version IS NULL"
    );
  }

  // 8. Seed patch versions if empty
  const [patchVersionRows] = await pool.execute(
    "SELECT id FROM echotrail_itemmanager_patch_versions LIMIT 1"
  );
  if ((patchVersionRows as unknown[]).length === 0) {
    await pool.execute(
      "INSERT INTO echotrail_itemmanager_patch_versions (version, description, is_current, created_by) VALUES (?, ?, 0, ?)",
      ["Pre-3.0.0", "Changes made before the patch notes system was introduced.", "system"]
    );
    await pool.execute(
      "INSERT INTO echotrail_itemmanager_patch_versions (version, description, is_current, created_by) VALUES (?, ?, 1, ?)",
      ["3.0.0", null, "system"]
    );
  }

  // 9. Migration: add is_hidden column to history table if missing
  const [isHiddenCols] = await pool.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'echotrail_itemmanager_item_history'
       AND COLUMN_NAME = 'is_hidden'`
  );
  if ((isHiddenCols as unknown[]).length === 0) {
    await pool.execute(
      "ALTER TABLE echotrail_itemmanager_item_history ADD COLUMN is_hidden TINYINT NOT NULL DEFAULT 0 AFTER patch_version"
    );
  }

  // 10. Migration: update balance_config formula column from old enum keys to formula name
  const [currentConfig] = await pool.execute(
    "SELECT formula FROM echotrail_itemmanager_balance_config WHERE id = 1"
  ) as any;
  if (currentConfig.length > 0) {
    const currentFormula = currentConfig[0].formula;
    const oldEnumKeys = ["weight_x_max", "weight_x_avg", "weight_x_range", "flat_weight", "flat", "scaled", "linear"];
    if (oldEnumKeys.includes(currentFormula)) {
      await pool.execute(
        "UPDATE echotrail_itemmanager_balance_config SET formula = ? WHERE id = 1",
        ["Flat"]
      );
    }
  }
}
