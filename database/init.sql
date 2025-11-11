-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BasketballDB')
BEGIN
    CREATE DATABASE BasketballDB;
END
GO

USE BasketballDB;
GO

-- Tabla de Equipos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Teams')
BEGIN
    CREATE TABLE Teams (
        id VARCHAR(100) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        logo NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Tabla de Jugadores
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Players')
BEGIN
    CREATE TABLE Players (
        id VARCHAR(100) PRIMARY KEY,
        team_id VARCHAR(100) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        number VARCHAR(10) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Partidos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Games')
BEGIN
    CREATE TABLE Games (
        id INT IDENTITY(1,1) PRIMARY KEY,
        teamA_id VARCHAR(100),
        teamA_name NVARCHAR(255) NOT NULL,
        teamB_id VARCHAR(100),
        teamB_name NVARCHAR(255) NOT NULL,
        finalScoreA INT NOT NULL,
        finalScoreB INT NOT NULL,
        period INT NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'completed', 'cancelled', 'suspended'
        stats NVARCHAR(MAX), -- JSON con estadísticas del juego
        settings NVARCHAR(MAX), -- JSON con configuración del partido
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (teamA_id) REFERENCES Teams(id),
        FOREIGN KEY (teamB_id) REFERENCES Teams(id)
    );
END
GO

-- Tabla de Historial de Jugadas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GameHistory')
BEGIN
    CREATE TABLE GameHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        game_id INT NOT NULL,
        team VARCHAR(1) NOT NULL, -- 'A' o 'B'
        player_name NVARCHAR(255),
        player_number VARCHAR(10),
        delta INT NOT NULL, -- Puntos anotados (+) o restados (-)
        scoreA INT NOT NULL,
        scoreB INT NOT NULL,
        period INT NOT NULL,
        timestamp BIGINT NOT NULL, -- Timestamp en milisegundos
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
    );
END
GO

-- Tabla de Sanciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sanctions')
BEGIN
    CREATE TABLE Sanctions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        game_id INT NOT NULL,
        team VARCHAR(1) NOT NULL, -- 'A' o 'B'
        player_name NVARCHAR(255),
        player_number VARCHAR(10),
        type VARCHAR(50) NOT NULL, -- 'Personal', 'Técnica', 'Antideportiva'
        period INT NOT NULL,
        timestamp BIGINT NOT NULL, -- Timestamp en milisegundos
        FOREIGN KEY (game_id) REFERENCES Games(id) ON DELETE CASCADE
    );
END
GO

-- Índices para mejorar el rendimiento (compatibles con SQL Server)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_players_team' AND object_id = OBJECT_ID('Players')
)
BEGIN
    CREATE INDEX idx_players_team ON Players(team_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_gamehistory_game' AND object_id = OBJECT_ID('GameHistory')
)
BEGIN
    CREATE INDEX idx_gamehistory_game ON GameHistory(game_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_sanctions_game' AND object_id = OBJECT_ID('Sanctions')
)
BEGIN
    CREATE INDEX idx_sanctions_game ON Sanctions(game_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'idx_games_created' AND object_id = OBJECT_ID('Games')
)
BEGIN
    CREATE INDEX idx_games_created ON Games(created_at);
END
GO

PRINT 'Base de datos BasketballDB inicializada correctamente';
GO
