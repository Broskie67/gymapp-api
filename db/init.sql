IF DB_ID('GymApp') IS NULL
BEGIN
  CREATE DATABASE GymApp;
END
GO

USE GymApp;
GO

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSUTCDATETIME()
  );

  CREATE UNIQUE INDEX UX_users_email ON dbo.users(email);
  CREATE UNIQUE INDEX UX_users_username ON dbo.users(username);
END
GO

IF OBJECT_ID('dbo.refresh_tokens', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.refresh_tokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash NVARCHAR(MAX) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    revoked BIT NOT NULL CONSTRAINT DF_refresh_tokens_revoked DEFAULT 0,
    CONSTRAINT FK_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_refresh_tokens_user_id ON dbo.refresh_tokens(user_id);
END
GO

IF OBJECT_ID('dbo.exercises', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.exercises (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    muscle_group NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_exercises_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_exercises_updated_at DEFAULT SYSUTCDATETIME()
  );

  CREATE UNIQUE INDEX UX_exercises_name ON dbo.exercises(name);
END
GO

IF OBJECT_ID('dbo.workout_lists', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.workout_lists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_workout_lists_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_workout_lists_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_workout_lists_users FOREIGN KEY (user_id) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_workout_lists_user_id ON dbo.workout_lists(user_id);
END
GO

IF OBJECT_ID('dbo.workout_list_exercises', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.workout_list_exercises (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workout_list_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sort_order INT NOT NULL,
    target_sets INT NULL,
    target_reps NVARCHAR(50) NULL,
    notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_workout_list_exercises_workout_lists FOREIGN KEY (workout_list_id) REFERENCES dbo.workout_lists(id),
    CONSTRAINT FK_workout_list_exercises_exercises FOREIGN KEY (exercise_id) REFERENCES dbo.exercises(id)
  );

  CREATE INDEX IX_workout_list_exercises_workout_list_id ON dbo.workout_list_exercises(workout_list_id);
END
GO

IF OBJECT_ID('dbo.workout_schedule', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.workout_schedule (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    workout_list_id INT NOT NULL,
    day_of_week TINYINT NULL, -- 1=Monday ... 7=Sunday
    scheduled_date DATE NULL, -- optional for one-off scheduling
    is_active BIT NOT NULL CONSTRAINT DF_workout_schedule_is_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_workout_schedule_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_workout_schedule_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_workout_schedule_users FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    CONSTRAINT FK_workout_schedule_workout_lists FOREIGN KEY (workout_list_id) REFERENCES dbo.workout_lists(id)
  );

  CREATE INDEX IX_workout_schedule_user_id ON dbo.workout_schedule(user_id);
  CREATE INDEX IX_workout_schedule_user_day_of_week ON dbo.workout_schedule(user_id, day_of_week);
  CREATE INDEX IX_workout_schedule_user_scheduled_date ON dbo.workout_schedule(user_id, scheduled_date);
END
GO
