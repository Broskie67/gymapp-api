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
