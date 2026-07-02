-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: repairsim1
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `desafio_itens`
--

DROP TABLE IF EXISTS `desafio_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desafio_itens` (
  `id_desafio_item` int NOT NULL AUTO_INCREMENT,
  `id_desafio` int NOT NULL,
  `id_item` int NOT NULL,
  `e_correto` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_desafio_item`),
  KEY `fk_desafio_itens_desafio` (`id_desafio`),
  KEY `fk_desafio_itens_item` (`id_item`),
  CONSTRAINT `fk_desafio_itens_desafio` FOREIGN KEY (`id_desafio`) REFERENCES `desafios` (`id_desafio`) ON DELETE CASCADE,
  CONSTRAINT `fk_desafio_itens_item` FOREIGN KEY (`id_item`) REFERENCES `itens` (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desafio_itens`
--

LOCK TABLES `desafio_itens` WRITE;
/*!40000 ALTER TABLE `desafio_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `desafio_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `desafios`
--

DROP TABLE IF EXISTS `desafios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desafios` (
  `id_desafio` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(80) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `imagem_pc` varchar(255) NOT NULL,
  `dica` varchar(255) DEFAULT NULL,
  `dificuldade` enum('Facil','Medio','Dificil') NOT NULL,
  `pontos_base` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_desafio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desafios`
--

LOCK TABLES `desafios` WRITE;
/*!40000 ALTER TABLE `desafios` DISABLE KEYS */;
/*!40000 ALTER TABLE `desafios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens`
--

DROP TABLE IF EXISTS `itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens` (
  `id_item` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `tipo` enum('peca','ferramenta') NOT NULL,
  `caminho_imagem` varchar(255) NOT NULL,
  PRIMARY KEY (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens`
--

LOCK TABLES `itens` WRITE;
/*!40000 ALTER TABLE `itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relatorio`
--

DROP TABLE IF EXISTS `relatorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relatorio` (
  `id_relatorio` int NOT NULL AUTO_INCREMENT,
  `id_resultado` int NOT NULL,
  `texto_base` text NOT NULL,
  `peca_escolhida` varchar(80) NOT NULL,
  `ferramenta_escolhida` varchar(80) NOT NULL,
  `observacao` text,
  PRIMARY KEY (`id_relatorio`),
  UNIQUE KEY `id_resultado` (`id_resultado`),
  CONSTRAINT `fk_relatorio_resultado` FOREIGN KEY (`id_resultado`) REFERENCES `resultado` (`id_resultado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relatorio`
--

LOCK TABLES `relatorio` WRITE;
/*!40000 ALTER TABLE `relatorio` DISABLE KEYS */;
/*!40000 ALTER TABLE `relatorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultado`
--

DROP TABLE IF EXISTS `resultado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultado` (
  `id_resultado` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_desafio` int NOT NULL,
  `erros` int NOT NULL DEFAULT '0',
  `pontos` int NOT NULL DEFAULT '0',
  `tempo_segundos` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_resultado`),
  KEY `fk_resultado_usuario` (`id_usuario`),
  KEY `fk_resultado_desafio` (`id_desafio`),
  CONSTRAINT `fk_resultado_desafio` FOREIGN KEY (`id_desafio`) REFERENCES `desafios` (`id_desafio`),
  CONSTRAINT `fk_resultado_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultado`
--

LOCK TABLES `resultado` WRITE;
/*!40000 ALTER TABLE `resultado` DISABLE KEYS */;
/*!40000 ALTER TABLE `resultado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `username` varchar(40) NOT NULL,
  `data_nascimento` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-30 22:03:12
