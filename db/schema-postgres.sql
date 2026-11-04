-- GymApp : schéma PostgreSQL
-- Idempotent : peut être relancé sans erreur (IF NOT EXISTS).
-- La base elle-même (gymdb) est créée à part : en local via Docker, en prod par l'hébergeur.

-- ============ users ============
CREATE TABLE IF NOT EXISTS users (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email    ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users (username);

-- ============ refresh_tokens ============
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT        NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked    BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens (user_id);

-- ============ exercises ============
CREATE TABLE IF NOT EXISTS exercises (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    muscle_group  VARCHAR(100),
    exercise_type VARCHAR(100),
    equipment     VARCHAR(100),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_exercises_name ON exercises (name);

-- ============ workout_lists ============
CREATE TABLE IF NOT EXISTS workout_lists (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     INT          NOT NULL REFERENCES users (id),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_workout_lists_user_id ON workout_lists (user_id);

-- ============ workout_list_exercises ============
CREATE TABLE IF NOT EXISTS workout_list_exercises (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_list_id INT NOT NULL REFERENCES workout_lists (id),
    exercise_id     INT NOT NULL REFERENCES exercises (id),
    sort_order      INT NOT NULL,
    target_sets     INT,
    target_reps     VARCHAR(50),
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS ix_workout_list_exercises_workout_list_id
    ON workout_list_exercises (workout_list_id);

-- ============ workout_schedule ============
CREATE TABLE IF NOT EXISTS workout_schedule (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INT         NOT NULL REFERENCES users (id),
    workout_list_id INT         NOT NULL REFERENCES workout_lists (id),
    day_of_week     SMALLINT,              -- 1=Monday ... 7=Sunday
    scheduled_date  DATE,                  -- optional for one-off scheduling
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_workout_schedule_user_id
    ON workout_schedule (user_id);
CREATE INDEX IF NOT EXISTS ix_workout_schedule_user_day_of_week
    ON workout_schedule (user_id, day_of_week);
CREATE INDEX IF NOT EXISTS ix_workout_schedule_user_scheduled_date
    ON workout_schedule (user_id, scheduled_date);